# Fisiofes Portal

Sitio y portal de reservas de Fisiofes (Calarcá y Senior's Mall, Quindío): servicios, planes, reserva de clases de Pilates y Entrenamiento funcional, y panel de administración.

Next.js 16 sobre [vinext](https://github.com/cloudflare/vinext), desplegado en Cloudflare Workers con D1 (SQLite) y Drizzle ORM. Textos en español de Colombia.

## Requisitos

- Node.js `>=22.13.0`
- npm (el lockfile de referencia es `package-lock.json`)

## Comandos

```bash
npm run install:ci   # instalación limpia
npm run dev          # desarrollo con HMR (puerto 5173)
npm run build        # build de producción
npm start            # corre el build localmente con Wrangler
npm run lint
npm test             # pruebas de lib/*.test.ts
npm run db:generate  # genera migraciones Drizzle
```

Formato: Prettier (`.prettierrc.json`). Ejecuta `npx prettier --write <archivos>` antes de abrir un PR.

## Estructura

| Ruta | Contenido |
|------|-----------|
| `app/` | Páginas y rutas API (`app/api/*`) |
| `components/` | Componentes del sitio; `components/ui/` es la base shadcn, no editar sin necesidad |
| `lib/booking-rules.ts` | Horarios, cupos, crédito y política de cancelación |
| `db/schema.ts` | Tablas `clients`, `class_slots`, `bookings` |
| `build/`, `vendor/`, `scripts/` | Infraestructura de la plataforma de hosting; no tocar |

## Variables de entorno

- `FISIOFES_ADMIN_EMAIL`: correo con acceso a `/admin` y `/api/admin/*`.
- `AUTH_SECRET`: clave larga y aleatoria para firmar los códigos de ingreso. Obligatoria; sin ella el ingreso responde 503.
- `OTP_WEBHOOK_URL` y `OTP_WEBHOOK_SECRET`: webhook (n8n / WhatsApp) que recibe `{ phone, code, message }` y envía el mensaje. Sin `OTP_WEBHOOK_URL` el ingreso solo funciona en desarrollo, mostrando el código en pantalla.

En local, crea un archivo `.dev.vars` (ignorado por git) con `AUTH_SECRET=...`.

Nunca subas secretos al repositorio.

## Flujo de trabajo en equipo

Ver [AGENTS.md](AGENTS.md). Estado y hallazgos pendientes: [AUDITORIA-PORTAL.md](AUDITORIA-PORTAL.md).
