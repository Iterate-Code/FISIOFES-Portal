# Guía de salida a producción — Fisiofes Portal

Estado: 7 PR abiertos y apilados, ninguno fusionado. Este documento dice en qué orden fusionarlos, qué hacer en producción y qué falta decidir con Fisiofes. Fecha: 2026-10-23.

## Resumen

1. Fusiona los PR en orden (#1 a #7). Cada uno depende del anterior.
2. Antes de abrir el sitio al público, define las **tres variables nuevas**, aplica las **migraciones 0001 a 0003** y conecta el **envío de códigos por WhatsApp**. Sin eso, nadie puede ingresar ni reservar.
3. Revisa el riesgo de la carpeta `out/` (abajo): puede seguir publicando los precios antiguos.
4. Cierra las decisiones pendientes con Fisiofes (lista al final). Dos de ellas bloquean la publicación: las reglas de alerta clínicas y el texto legal del consentimiento.

## 1. Orden de fusión

| Orden | PR | Fase | Rama (base) | Qué trae | Migración |
|---|---|---|---|---|---|
| 1 | [#1](https://github.com/Iterate-Code/FISIOFES-Portal/pull/1) | 0 | `fase-0-formato` (main) | Prettier, README, AGENTS.md, auditoría | — |
| 2 | [#2](https://github.com/Iterate-Code/FISIOFES-Portal/pull/2) | 1 | `fase-1-catalogo` (fase-0) | Catálogo con "Desde", 11 categorías, sin precios exactos | — |
| 3 | [#3](https://github.com/Iterate-Code/FISIOFES-Portal/pull/3) | 2 | `fase-2-prevaloracion` (fase-1) | Pre-valoración y triaje en el servidor | `0001` |
| 4 | [#4](https://github.com/Iterate-Code/FISIOFES-Portal/pull/4) | 3 | `fase-3-ingreso` (fase-2) | Registro e ingreso por código de WhatsApp, Mi Fisiofes | `0002` |
| 5 | [#5](https://github.com/Iterate-Code/FISIOFES-Portal/pull/5) | 4 | `fase-4-reserva` (fase-3) | Reserva en pasos con sesión y sede, sin PIN | `0003` |
| 6 | [#6](https://github.com/Iterate-Code/FISIOFES-Portal/pull/6) | 4b | `fase-4b-vista-equipo` (fase-4) | Vista del equipo en `/admin` | — |
| 7 | [#7](https://github.com/Iterate-Code/FISIOFES-Portal/pull/7) | 5 | `fase-5-accesibilidad` (fase-4b) | Accesibilidad 65+, esta guía | — |

### Cómo fusionar los PR apilados

**Opción A (recomendada): uno por uno con "Create a merge commit".**
1. Fusiona #1 en `main` con **merge commit**, no squash. Con squash, los PR siguientes muestran conflictos falsos porque el commit cambia.
2. Abre #2 y cambia su base de `fase-0-formato` a `main` (GitHub lo ofrece al cerrar la rama base, o se hace en "Edit"). Fusiona.
3. Repite hasta #7. Revisa en cada paso que el diff solo muestre los cambios de esa fase.

**Opción B (más rápida, menos revisable): un solo PR.** Abre un PR de `fase-5-accesibilidad` a `main` que contiene todo, y cierra los otros siete. Úsala solo si ya revisaron cada fase.

No hay integración continua configurada (no existe `.github/`). Antes de cada fusión corre en local:

```bash
npm ci
npm test
npx prettier --check "app/**/*.{ts,tsx,css}" "components/*.tsx" "lib/**/*.ts"
```

Verificado en el último commit: 36 de 36 pruebas pasan y Prettier no reporta diferencias. `tsc` y `eslint` tienen errores que ya existían en `components/ui/`, `cancelar`, `connector-error` y `admin-dashboard` y que no se tocaron.

## 2. Migraciones de base de datos

La base es Cloudflare D1 (SQLite) con Drizzle. Los archivos están en `drizzle/`.

| Archivo | Llega con | Contenido |
|---|---|---|
| `0000_common_jigsaw.sql` | ya está en `main` | tablas `clients`, `class_slots`, `bookings` |
| `0001_brief_hercules.sql` | #3 | tabla `prescreenings` |
| `0002_early_anita_blake.sql` | #4 | tablas `otp_codes` y `sessions`; columna `clients.consent_at` |
| `0003_deep_darkstar.sql` | #5 | tabla `appointment_requests` |

- Todas **solo agregan** tablas o una columna nula. No borran ni modifican datos existentes, así que son seguras para aplicar sobre la base actual.
- Aplícalas en orden y antes de publicar el código de la fase correspondiente. Si publicas el código sin la migración, la ruta responde 500.
- **No sé cómo la plataforma de hosting aplica las migraciones en producción** (el README del starter solo describe el flujo local). Confírmalo antes de fusionar #3. En local usé:

```bash
npx wrangler d1 migrations apply DB --local --config <wrangler.json con migrations_dir "drizzle">
```

  Para producción cambia `--local` por `--remote` con la base real, o usa el mecanismo del hosting.
- La columna `clients.access_pin_hash` queda sin uso desde #5. No se borró para evitar una migración destructiva. Se puede eliminar más adelante.
- **Clientes que ya existen:** al ingresar por código, el sistema los busca por teléfono (formato `+57XXXXXXXXXX`). Si el cliente ya está cargado con ese número, conserva su plan y créditos; si no coincide el número, se crea un cliente nuevo sin plan. Revisa en producción que los teléfonos estén normalizados.

## 3. Variables de entorno

| Variable | Obligatoria | Para qué | Dónde |
|---|---|---|---|
| `FISIOFES_ADMIN_EMAIL` | sí (ya existía) | Correo que puede abrir `/admin` y `/api/admin/*` | hosting |
| `AUTH_SECRET` | **sí (nueva)** | Firma de los códigos de ingreso. Sin ella `/api/auth/*` responde 503 | hosting, como secreto |
| `OTP_WEBHOOK_URL` | **sí en producción (nueva)** | Webhook que envía el código por WhatsApp. Sin ella el ingreso solo funciona en desarrollo | hosting |
| `OTP_WEBHOOK_SECRET` | recomendada (nueva) | Se envía como `Authorization: Bearer …` al webhook | hosting, como secreto |

Genera `AUTH_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Reglas: no la subas al repositorio ni la compartas por chat. Si cambia, los códigos pendientes dejan de ser válidos (las sesiones abiertas siguen funcionando). En local va en `.dev.vars`, que git ignora.

### Contrato del webhook de WhatsApp

El portal hace un `POST` con este cuerpo JSON y espera un `2xx`:

```json
{ "phone": "+573001234567", "code": "123456", "message": "Tu código de Fisiofes es 123456. Vence en 10 minutos. No lo compartas con nadie." }
```

Un flujo de n8n con la API oficial de WhatsApp Business debe: recibir el webhook, validar el encabezado `Authorization`, enviar `message` a `phone` y responder 200. Si falla, el portal responde "No pudimos enviar el código" y el usuario puede reintentar (máximo 3 códigos cada 10 minutos por teléfono).

Prueba antes de publicar: pide un código desde `/ingresar` con un número real del equipo y comprueba que llega al WhatsApp.

## 4. Verificación después de publicar

1. `/precios`, `/servicios` y la home solo muestran valores "Desde". Busca `$` en el HTML publicado y confirma que no aparecen precios por paquete.
2. Ingresar con un número nuevo: llega el código, se crea la cuenta, se llega a Mi Fisiofes.
3. Ingresar con un cliente existente: conserva su plan y créditos.
4. Reservar una clase con plan: confirma al instante, descuenta un crédito y se puede cancelar desde Mi Fisiofes.
5. Pedir una cita de fisioterapia: aparece en `/admin`, pestaña Solicitudes.
6. Hacer una pre-valoración con una respuesta de alerta (por ejemplo dolor de pecho): aparece en `/admin` con "Llamar antes de agendar".
7. `/admin` solo abre con `FISIOFES_ADMIN_EMAIL`.

## 5. Riesgos conocidos

1. **La carpeta `out/` está versionada y contiene la versión antigua del sitio con todos los precios** (`out/index.html`, `out/precios.html`). No sé si el hosting publica `out/` o compila desde el código. Si publica `out/`, los precios exactos seguirán visibles aunque se fusionen los PR. Confírmalo con quien configuró el hosting; si es una exportación vieja, hay que regenerarla o quitarla del repositorio.
2. Las reglas de alerta clínica son un **borrador** sin validar por la directora clínica.
3. El texto de consentimiento de datos no lo revisó un abogado.
4. No hay límite de intentos por IP, solo por teléfono. Conviene una regla de Cloudflare delante de `/api/auth/*` y `/api/prescreening`.
5. No hay integración continua ni pruebas de API o de interfaz automáticas. Las pruebas actuales cubren solo la lógica de `lib/`.
6. Accesibilidad: se midió tamaño de texto, contraste y objetivos táctiles, pero **no se probó con lector de pantalla ni con personas mayores**. El contraste de texto sobre imágenes y degradados no se midió con herramienta.
7. Confirmar una solicitud en `/admin` no avisa al cliente: el equipo debe escribirle por WhatsApp (hay un enlace en cada tarjeta).
8. Los horarios y cupos están fijos en `lib/booking-rules.ts`. La fisioterapia no tiene agenda: solo solicitudes.
9. La reserva y los datos viven en una base propia; no hay conexión con Saludtools. Los datos de pacientes quedarán duplicados hasta que se integre.

## 6. Lo que hay que decidir con Fisiofes

| # | Decisión | Quién | Estado | Dónde se cambia |
|---|----------|-------|--------|-----------------|
| 1 | Número de WhatsApp o teléfono público de la clínica (hoy solo hay un número de pagos en los documentos) | Dueña / equipo | Falta | `lib/contact.ts`, constante `CLINIC_WHATSAPP` |
| 2 | Canal y cuenta para enviar el código (API oficial de WhatsApp vía n8n u otro) | Tú y tu socio | Falta | variables `OTP_WEBHOOK_*` |
| 3 | Validar las reglas de alerta de la pre-valoración (dolor de pecho, caídas repetidas, cirugía reciente, dolor 8+, embarazo) y la lista de condiciones | Directora clínica | Borrador | `lib/prescreening.ts` |
| 4 | Texto de consentimiento de datos de salud (Ley 1581 de 2012) y política de borrado | Asesoría legal | Borrador | `login-experience.tsx`, `prescreening-wizard.tsx` |
| 5 | "Desde" de Pilates: hoy $40.000 (primera clase). Alternativa: $60.000 (clase suelta) | Dueña | Elegido $40.000; confirmar | `lib/catalog.ts` |
| 6 | Tarifas pendientes: valoración con ecografía, valoración funcional de longevidad, Tensamax, electrólisis percutánea | Dueña | Sin tarifa; el sitio dice "a consultar" | `lib/catalog.ts` |
| 7 | Boutique ortopédica: ¿solo vitrina o venta en línea? Hoy es una tarjeta "consulta con el equipo" | Dueña | Falta | `lib/catalog.ts` |
| 8 | Dirección exacta de Senior's Mall (los documentos dicen "km 10 vía al Aeropuerto" y "km 1 vía Club Campestre – El Caimo", y "Local 2" o "Local 3") | Dueña | Inconsistente; el sitio usa "Vía La Tebaida–El Caimo, km 1" | `app/page.tsx`, `components/booking/choices.tsx`, `app/contacto/page.tsx` |
| 9 | Política de cancelación: hoy 2 horas de anticipación devuelve el crédito; los documentos dicen que no existe una política formal | Dueña | Falta confirmar | `lib/booking-rules.ts` |
| 10 | ¿La fisioterapia se reserva con agenda real o seguirá como solicitud que confirma una persona? | Dueña + directora clínica | Hoy solicitud | fase futura |
| 11 | Integración con Saludtools como fuente de pacientes y agenda | Tú y tu socio | Sin empezar | fase futura |
| 12 | Horarios distintos para Pilates y Entrenamiento (hoy comparten la misma grilla) | Dueña | Falta | `lib/booking-rules.ts` |
| 13 | Servicios empresariales: ¿página propia con solicitud de propuesta? | Dueña | Hoy solo una tarjeta | `lib/catalog.ts` |
| 14 | Sesión de prueba con 3 a 5 personas de 65 años o más sobre `/prevaloracion` y `/contacto` | Tú | Falta | — |

## 7. Trabajo con Codex y tu socio

- Las reglas del proyecto están en `AGENTS.md`. Cada persona trabaja en su rama y abre PR hacia `main` una vez fusionada la cadena.
- Los archivos más propensos a conflicto: `app/globals.css` (todas las fases añaden bloques al final) y `app/page.tsx`. Fusionen la cadena completa antes de abrir ramas nuevas.
- Siguientes tareas con valor, en este orden sugerido: (1) conectar el envío de WhatsApp y probar el ingreso real; (2) validar las reglas clínicas; (3) aviso automático al confirmar solicitudes; (4) integración con Saludtools; (5) pruebas automáticas de API y de interfaz, e integración continua.
