# Portal Naty — Estado del Proyecto

Documento vivo para que un agente AI entienda el estado actual del proyecto `portal_naty`.

---

## Páginas (menú superior)

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Calendario | `index.html` | Feriados de 11 países, vistas Mes/Bimestre/Semestre, impresión, notas por día |
| Horarios | `diferencia-horaria.html` | Diferencia horaria vs Colombia (tabla dinámica + estática) |
| Organigrama | `organigrama.html` | Organigrama por países con datos de cargos |
| CRM | `crm.html` | Gestión de clientes/oportunidades con persistencia en servidor |

El menú superior lo inyecta `js/nav.js` en todas las páginas (marca el enlace activo según la URL).

## Países (11)

Chile, Colombia, Costa Rica, Ecuador, El Salvador, Guatemala, Honduras, México, Nicaragua, Panamá, Perú.

## Calendario

- Datos de feriados: `js/holidays.js` (Jul-Dic 2026, fuente: officeholidays.com)
- Lógica: `js/app.js`
- Vistas: **MES** (navegación ◀ ▶), **BIMESTRE** (2 meses), **SEMESTRE** (6 meses en grilla)
- Mes inicial al abrir: mes actual dentro de Jul-Dic 2026
- Impresión: botón 🖨 abre 2 meses lado a lado (orientación horizontal)
- **Notas por día**: clic en un día abre panel con feriados + nota editable. Se guardan en el servidor (`calendario_notas.json`) y se muestran dentro de la celda con recorte (puntos suspensivos)

## Horarios

- Tabla dinámica (hora en vivo, se actualiza cada segundo) + tabla estática con validez
- Fuente de zonas: **TimeZoneDB** (CC BY 3.0), datos en `js/timezone-data.js`
- Referencia: Colombia (UTC-5)
- Chile: +1h hasta el 6 sep 2026; +2h desde el 6 sep (horario de verano) — calculado con reglas DST explícitas
- Incluye EE. UU. (Miami): +1h hasta el 1 nov 2026, luego 0h

## Organigrama

- Datos: `js/organigrama.js` (árbol jerárquico: Hernan Freire → Sergio Lievano → Natalia Santamaria → países)
- Países con colores vivos; roles/directivos en tonos grises por nivel
- Cargos multilínea (cada segmento en su línea)
- Ancho completo con desplazamiento horizontal

## CRM

- `crm.html` + `js/crm.js`
- Campos: cliente (canal), región, línea, SKU, unidades, promo, skuPromo, precio cliente, precio Intcomex, fecha estimada cierre, estado, observaciones, fecha de registro y fecha de último estado (automáticas)
- **Estados**: Lead, Cotizado, En Negociación, Facturado, Cerrado
- **Filtros**: Región y Cliente multi-selección (popup con checkboxes), Estado (select), rango de fechas (botón + popup con desde/hasta para cada fecha)
- CRUD con modal; **observaciones** como botón con popup (color azul si hay, gris si no); **Editar/Eliminar** como iconos con tooltip
- **Campana 🔔** (top derecha): lista notas del calendario — 3 días anteriores (gris), hoy (verde), 5 siguientes (azul); solo días con nota
- Exportar/Importar CSV
- Autocompletado de cliente (datalist) y de región según cliente

## Persistencia (backend PHP)

- `api.php` (PHP 8.2, Apache)
  - `GET/POST api.php` → `data/clientes.json` (clientes)
  - `GET/POST api.php?tipo=calendario` → `data/calendario_notas.json`
- **Volumen persistente**: `naty-crm-data` montado en `/var/www/html/data`
- Fallback a localStorage si la API falla

## Deploy

- **Build Pack**: Dockerfile (`php:8.2-apache`), Dockerfile en la raíz
- `.dockerignore` excluye `temp/`, `data/`, `.git`
- Push a `master` → Coolify despliega automáticamente
- El volumen persiste los datos entre deploys

## Git

- Usuario: `jrchejab` (`jrchejab@gmail.com`)
- Remote: `https://jrchejab@github.com/jrchejab/portal_naty.git`
- **IMPORTANTE**: Windows Credential Manager tiene varias cuentas GitHub (poordesigner, jrchejab, tachoatomico, x-access-token). El `jrchejab@` explícito en la URL fuerza la cuenta correcta al hacer push.
