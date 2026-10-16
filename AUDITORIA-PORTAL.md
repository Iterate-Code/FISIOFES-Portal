# Auditoría del portal Fisiofes — registro, reserva, pre-valoración y adulto mayor

Fecha: 2026-10-16 · Alcance: código de `main` (commit 2d7cc12), lectura estática. No se ejecutó la app ni se probó con usuarios.

## Conclusión

El portal hoy **no tiene registro real, no tiene pre-valoración, y la reserva solo funciona para clientes que Fisiofes ya cargó a mano con PIN y créditos**. Un adulto mayor nuevo no puede completar nada solo. Además, `/precios` publica todas las tarifas y la home muestra precios en tres tarjetas; y el catálogo omite servicios y productos que Fisiofes sí ofrece.

---

## 1. Registro / ingreso

| # | Hallazgo | Evidencia | Severidad |
|---|----------|-----------|-----------|
| R1 | `/ingresar` es una **maqueta**: pide correo o WhatsApp y muestra "Vista de demostración". No autentica ni consulta nada. | `components/login-experience.tsx:13-20` | Alta |
| R2 | **No existe registro.** El perfil se crea como efecto secundario del primer intento de reserva, y el usuario recibe un error 402 "PLAN_REQUIRED". | `app/api/bookings/route.ts:275-278` | Alta |
| R3 | El acceso depende de un **PIN numérico que entrega el equipo** (4–8 dígitos). Un cliente nuevo no puede obtenerlo solo; un adulto mayor tiene que recordarlo. | `lib/security.ts`, `app/api/admin/clients/route.ts` | Alta |
| R4 | El PIN se guarda como **SHA-256 sin sal**. Con 4–8 dígitos se rompe en milisegundos si se filtra la base. | `lib/security.ts:1-9` | Alta (seguridad) |
| R5 | **Sin límite de intentos** en `/api/bookings`: se puede adivinar un PIN de 4 dígitos (10.000 combinaciones) conociendo el teléfono. Los mensajes "Teléfono o PIN incorrecto" no filtran cuál falló, bien, pero no hay bloqueo. | `app/api/bookings/route.ts:279` | Alta (seguridad) |
| R6 | **Sin consentimiento de datos** (Ley 1581 de 2012, tratamiento de datos de salud). No hay casilla ni aviso en ningún formulario. | `booking-experience.tsx` | Alta (legal) |
| R7 | El texto de `/ingresar` promete "código de acceso, sin contraseña". Está bien como dirección, pero hoy no existe el envío (WhatsApp/SMS/correo). | `login-experience.tsx:22` | Media |

**Recomendación:** reemplazar PIN por código de un solo uso por WhatsApp (el canal que ya usan), con registro de 3 campos (nombre, WhatsApp, fecha de nacimiento opcional) y consentimiento de datos. Limitar intentos por teléfono e IP.

## 2. Reserva

| # | Hallazgo | Evidencia | Severidad |
|---|----------|-----------|-----------|
| B1 | Solo se pueden reservar **Pilates y Entrenamiento funcional**. No hay fisioterapia, valoración, terapias ni procedimientos, que son el punto de entrada de la mayoría de pacientes mayores. | `booking-experience.tsx:6`, `booking-rules.ts:1` | Alta |
| B2 | La home y `/contacto` prometen "reserva sin pago, confirmamos contigo, 2 minutos", pero el formulario **exige crédito activo y PIN**. Promesa y comportamiento se contradicen. | `app/page.tsx` sección `booking-invite` vs `api/bookings/route.ts:279-281` | Alta |
| B3 | `/contacto` dice "solicita el horario", pero el sistema **descuenta un crédito de inmediato** y confirma. No es una solicitud. | `app/contacto/page.tsx:78` | Media |
| B4 | **Sin selección de sede.** Hay dos (Calarcá y Senior's Mall), la página de reserva dice solo "Senior's Mall · dirección por confirmar" y la home lista una dirección real. Inconsistencia. | `contacto/page.tsx`, `page.tsx` sección `locations` | Alta |
| B5 | Horarios **fijos en código** (`WEEKDAY_TIMES`) para todos los días; no hay festivos, instructores, ni cierres. Los cupos 5/4 también están fijos. | `lib/booking-rules.ts:19-21` | Media |
| B6 | La fecha usa `<input type="date">` nativo y hay que elegir día antes de ver horarios. Sin vista "próximos horarios disponibles". | `booking-experience.tsx:41` | Media |
| B7 | Cancelación solo por **enlace con token** que se muestra una vez en pantalla. Si el usuario cierra la pestaña, no puede cancelar. No hay confirmación por WhatsApp/correo. | `booking-experience.tsx:38`, `cancelar/page.tsx` | Alta |
| B8 | Fallas de concurrencia: el crédito se descuenta antes de reservar el cupo y se restaura en errores; si el restore falla (red) se pierde un crédito. En cancelación, `bookedCount` y el crédito se actualizan en pasos separados sin transacción. | `bookings/route.ts:287-304`, `cancel/route.ts:327-331` | Media |
| B9 | Cancelación: `creditRefunded` solo si faltan ≥2 h. Regla correcta, pero la página no muestra la hora de la clase antes de confirmar. | `cancelar/page.tsx` | Baja |
| B10 | **La zona horaria está fija a -05:00**. Correcto para Colombia. Sin cambios, solo anotar. | `booking-rules.ts` | Info |

## 3. Pre-valoración

**No existe.** No hay cuestionario previo, ni triaje, ni captura de motivo de consulta, dolor, cirugías, medicamentos, caídas o limitaciones. Es el hueco más grande frente a lo que vende la marca ("primero entendemos, después avanzamos").

Propuesta mínima (6–8 preguntas, una por pantalla, ~2 min):

1. ¿Qué quieres volver a hacer? (usa los chips de la home: caminar con el perro, recuperarme de cirugía…)
2. ¿Dónde te duele o qué te limita? (silueta con zonas grandes)
3. ¿Desde cuándo y cuánto dolor hay hoy? (0–10 con caritas)
4. ¿Has tenido caídas o pérdida de equilibrio en el último año?
5. ¿Cirugías, prótesis o condiciones cardíacas/presión? (sí/no + texto libre)
6. ¿Prefieres sede Calarcá o Senior's Mall? ¿Mañana o tarde?
7. Datos de contacto + consentimiento de datos de salud.

Resultado: la persona recibe **recomendación de punto de partida** (valoración osteomuscular, valoración funcional o primera clase) y el equipo recibe la ficha lista. Las respuestas con banderas rojas (caída reciente, dolor torácico, cirugía <6 semanas) deben **derivar a llamada humana**, no a reserva automática. Esto requiere definir las reglas con la fisioterapeuta directora antes de codificarlas.

Datos nuevos necesarios en `db/schema.ts`: tabla `prescreenings` (cliente, respuestas JSON, banderas, versión del cuestionario, consentimiento y fecha).

## 4. Precios públicos (cambio pedido: mostrar solo "desde")

Hoy se muestran precios exactos aquí:

- `app/precios/page.tsx` — **todas** las tarifas, precio por clase, ahorro por paquete y nota interna visible al público ("deben recibir aprobación final del equipo antes de salir a producción", líneas finales).
- `app/page.tsx` — tres tarjetas `priority-card` con `$60.000`, `$40.000`, `$450.000 · $37.500/clase`.
- `app/servicios/*/page.tsx` y `components/service-page.tsx` — prop `price` ya se muestra como "DESDE", correcto, pero en Pilates el valor es `$40.000` (oferta de primera clase), no el mínimo real del catálogo (`$37.500/clase` en el paquete de 12).

Propuesta:

1. Convertir `/precios` en **"Servicios y planes"** sin cifras: tarjetas por categoría con "Desde $X" y botón "Ver opciones con el equipo / Reservar valoración".
2. Calcular `desde` por categoría a partir de una **única fuente de datos** (`lib/catalog.ts`), para que cambiar un precio se haga en un solo lugar y nadie olvide una página.
3. Reemplazar las tarjetas de la home por "Desde" o quitarlas.
4. Decidir con el socio y Fisiofes **qué significa "desde"**: precio de la primera sesión suelta o el mínimo por unidad en paquete (ej. Pilates: $60.000 vs $37.500). Recomiendo precio de entrada de la sesión suelta, que es más honesto.
5. **Quitar el párrafo "Transparencia…"** de `/precios`: expone pendientes internos.
6. El detalle de precios por paquete lo entrega el equipo en la conversación o en la valoración.

Nota: mantener precios exactos solo detrás de login o en el flujo de reserva ya cumple lo pedido y facilita la compra de paquetes después.

## 5. Catálogo: servicios y productos que faltan

Según `Info Completa para Web y Agendamiento - Fisiofes.md`, el portal solo muestra 4 servicios. Falta:

| Falta en el portal | Estado en documentos del cliente |
|--------------------|----------------------------------|
| Valoración ATM, Valoración con ecografía, Terapia neural, Vendaje neuromuscular (Kinesiotape) | Tarifas parciales; ecografía **sin tarifa** |
| Tensamax (postoperatorio, tratamientos faciales/corporales) | **Pendiente**: sin tarifa ni descripción |
| Electrólisis percutánea intratisular | **Sin tarifa** |
| Tipos de Pilates (Reformer, Mat, Contemporáneo, Clásico, Stretching, Jam) | Disponible |
| Tipos de entrenamiento (Full Core, Full Body, Spring Wall, TRX, Power Flow, Hyrox) | Disponible |
| Terapias de bienestar (4) y procedimientos (sueroterapia, PRP) | Existen en `/precios` pero **sin página de servicio** ni enlace desde `/servicios` |
| Servicios empresariales (bienestar corporativo B2B) | Recomendada página propia |
| **Boutique Ortopédica** (productos) | **No hay catálogo documentado**; decidir si es vitrina o venta en línea |

`app/servicios/page.tsx` lista 4 filas. Propongo 9 categorías con página propia y datos desde `lib/catalog.ts`. Para lo que no tiene tarifa, mostrar "Consulta con el equipo" y no inventar cifras.

**Decisión necesaria:** ¿la Boutique Ortopédica se vende en línea o solo se muestra? Si hay venta, hace falta inventario y pasarela, que es un proyecto aparte.

## 6. Usabilidad para adulto mayor

Hallazgos concretos en `app/globals.css` y componentes:

| # | Hallazgo | Evidencia |
|---|----------|-----------|
| U1 | **Texto demasiado pequeño** en elementos que importan: etiquetas de campo `14px`, botones de horario/ayudas `13–14px`, eyebrows `11–12px`, metadatos `10px`. Para 65+ el mínimo recomendado es 18px en cuerpo y 16px en ayudas. | `globals.css` líneas 59–127, 566 |
| U2 | Botones de 54–56 px de alto: aceptable, pero los **botones de horario** y `booking-option` son densos; separar más y agrandar a ≥ 56 px. | `globals.css:70,472,556` |
| U3 | Formulario de reserva es una sola pantalla larga con 7 campos y 3 pasos mezclados (servicio, fecha/hora, datos). Mejor un asistente de un paso por pantalla con barra de progreso, como ya insinúa la maqueta `booking-preview` de la home. | `booking-experience.tsx:41` |
| U4 | El campo "PIN de Fisiofes" es `type=password`: el usuario no ve lo que escribe y no sabe qué es ese PIN. Quitarlo (ver R3). | `booking-experience.tsx:41` |
| U5 | Mensajes de error genéricos, a veces con jerga ("PLAN_REQUIRED" se oculta bien, pero el texto "Tu perfil fue creado. Fisiofes debe activar un plan…" no dice qué hacer). Cada error debe decir **qué pasó y qué hacer**, con botón de WhatsApp/llamada. | `bookings/route.ts:277` |
| U6 | **Sin teléfono para llamar ni botón de WhatsApp** visible en la reserva. Para esta audiencia la salida humana es esencial. | `contacto/page.tsx` |
| U7 | Home recargada: animaciones, 4 videos con `autoPlay` + `controls`, consola de progreso decorativa. Los videos en autoplay distraen y consumen datos. | `app/page.tsx` |
| U8 | Lenguaje de marca ("Longevity Club", "Tecnología que personaliza", "semáforo funcional") puede resultar abstracto. Las rutas por frase ("Me duele…") van bien; extender ese estilo. | `app/page.tsx` |
| U9 | Contraste y foco: no verifiqué contra WCAG. Hay que medir colores `--muted` sobre fondos claros y asegurar anillos de foco visibles. | `globals.css` |
| U10 | `type="date"` nativo es difícil en móviles de algunos usuarios mayores; usar lista de "Hoy / Mañana / próximos 7 días" en botones grandes. | `booking-experience.tsx:41` |

Meta de accesibilidad: WCAG 2.2 AA, cuerpo 18px, objetivos táctiles ≥ 48 px (idealmente 56), un solo objetivo por pantalla, confirmación por WhatsApp.

## 7. Otros hallazgos que afectan el trabajo en equipo

- **El código está en una sola línea por componente** (`booking-experience.tsx` línea 41 tiene ~3.000 caracteres). Es casi imposible revisar en PR y fusionar cambios de dos personas sin conflictos. **Reformatear con Prettier antes de que Codex y tu socio empiecen** o habrá conflictos constantes.
- El repo es una base `vinext-starter` (README genérico). Reemplazar el README por uno del proyecto y agregar `CLAUDE.md`/`AGENTS.md` con convenciones para que Codex y Claude trabajen igual.
- Solo hay un test: `lib/booking-rules.test.ts`. No hay pruebas de API ni de UI.
- `requireAdmin` confía en el header `oai-authenticated-user-email` y la variable `FISIOFES_ADMIN_EMAIL`; depende de la plataforma de hosting. Confirmar que no es falsificable fuera de ese hosting.
- La carpeta `vendor/`, `out/`, `build/` están versionadas; revisar `.gitignore`.
- Hay datos de contacto inconsistentes (dirección Senior's Mall "por confirmar" vs dirección real).

## 8. Plan por fases sugerido (para repartir entre Codex y tu socio)

| Fase | Entregable | Archivos | Riesgo de conflicto |
|------|------------|----------|---------------------|
| 0 | Formatear código, README y `AGENTS.md`, ramas por tarea | todo | Hacerla **primero y sola** |
| 1 | `lib/catalog.ts` + quitar precios públicos + nuevas páginas de servicios | `app/precios`, `app/servicios/*`, `app/page.tsx`, `service-page.tsx` | Medio |
| 2 | Pre-valoración (formulario + tabla + reglas de derivación) | nuevo `components/prescreening/*`, `db/schema.ts`, `app/api/prescreening` | Bajo |
| 3 | Registro + ingreso con código por WhatsApp, límites de intentos, consentimiento | `login-experience.tsx`, `lib/security.ts`, `app/api/auth/*`, `db/schema.ts` | Alto con fase 4 |
| 4 | Reserva en asistente por pasos, sede, servicios clínicos, confirmación y cancelación por WhatsApp | `booking-experience.tsx`, `api/bookings/*`, `booking-rules.ts` | Alto con fase 3 |
| 5 | Pasada de accesibilidad 65+ (tipografía, contraste, foco, pruebas con 3–5 usuarios reales) | `globals.css` y componentes | Alto: tocar al final |

## 9. Decisiones que necesito de ti y del equipo

1. ¿"Desde" = sesión suelta más barata o precio mínimo por unidad en paquete?
2. ¿Boutique Ortopédica: vitrina o venta en línea?
3. ¿Cómo se manda el código de acceso: WhatsApp (API oficial o n8n) o SMS/correo?
4. ¿Quién define con la fisioterapeuta las banderas rojas de la pre-valoración?
5. ¿La reserva de fisioterapia debe ser inmediata o "solicitud que el equipo confirma"?
6. ¿Dónde se integra Saludtools (fuente de verdad de pacientes)? Hoy el portal tiene su propia tabla `clients`, lo que duplica datos.
