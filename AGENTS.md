# AGENTS.md — guía para Codex, Claude y personas

Aplica a todo el repositorio. Léelo antes de cambiar código.

## Contexto

Portal de Fisiofes (fisioterapia, Pilates, entrenamiento funcional, longevidad). Público principal: adultos de 45+ y adultos mayores. Ver `README.md` para comandos y `AUDITORIA-PORTAL.md` para el plan por fases.

## Reglas de trabajo

1. **Una rama por tarea**, desde `main`: `fase-N-descripcion` o `feat/...`. PR pequeños. No hagas push directo a `main`.
2. **Antes de editar, revisa qué fase del plan toca tus archivos** (sección 8 de `AUDITORIA-PORTAL.md`) para no pisar el trabajo de otra persona. Si dos tareas tocan el mismo archivo, coordínalas.
3. **Cambios quirúrgicos:** modifica solo lo pedido. No reformatees ni "mejores" código ajeno en el mismo PR.
4. **Formato:** Prettier con `.prettierrc.json` (sin punto y coma, comillas simples, 100 columnas). Una sola línea larga de JSX está prohibida; parte el JSX en varias líneas.
5. **Archivos pequeños:** máximo ~400 líneas por archivo y 50 por función. `app/page.tsx` ya excede esto; al tocarlo, extrae secciones a `components/home/`.
6. **Inmutabilidad:** no mutes objetos ni arrays de estado; crea copias.
7. **Validación en los bordes:** toda ruta `app/api/*` valida entrada (zod) y devuelve errores con `jsonError`.
8. **Sin secretos en el código.** Usa variables de entorno y falla si faltan.
9. **Pruebas:** la lógica de negocio (`lib/`) lleva pruebas en `lib/*.test.ts`. Corre `npm test` y `npm run lint` antes de abrir el PR; no declares algo terminado sin ejecutar ambos.
10. No edites `build/`, `vendor/`, `scripts/`, `out/` ni `components/ui/` salvo petición explícita.

## Reglas de producto (acordadas)

- **No publicar precios exactos.** En el sitio público solo se muestra "Desde $X" por categoría. El detalle lo entrega el equipo.
- Mostrar **todos** los servicios y productos de Fisiofes. Lo que no tiene tarifa confirmada se muestra como "Consulta con el equipo"; nunca inventar cifras.
- **Pensar en adulto mayor:** texto de cuerpo ≥ 18 px, objetivos táctiles ≥ 48 px, una tarea por pantalla, mensajes de error que digan qué hacer, y siempre una salida humana (WhatsApp o llamada).
- Datos de salud: pedir consentimiento (Ley 1581 de 2012) y no registrar datos sensibles en logs.

## Idioma

Interfaz y contenido en español (Colombia), trato de "tú". Código, nombres de variables y commits en inglés o español, pero consistentes dentro de cada archivo.

## Commits

Formato `tipo: descripción` (feat, fix, refactor, docs, test, chore, perf, ci).
