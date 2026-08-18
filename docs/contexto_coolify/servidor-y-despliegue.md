# Contexto Coolify — Servidor y Despliegue

Ultima actualizacion: 2026-07-07

Documento simplificado para que un agente AI entienda como conectarse al servidor VPS y desplegar proyectos con Coolify.

---

## Datos del servidor

- Host: `vmi3279031`
- IP: `207.180.242.253`
- Usuario SSH: `root`
- Ruta inicial: `/root`
- Proxy: Coolify Proxy (`coolify-proxy`) maneja 80/443
- Nginx del SO debe estar detenido/deshabilitado

## Llaves SSH

### Maquina actual (DELL)

Las llaves estan en `C:\Users\DELL\.ssh\`:

| Archivo | Uso |
|---------|-----|
| `codex_portal_b2b` | Conexion manual (con passphrase) |
| `codex_portal_b2b.pub` | Publica |
| `codex_portal_b2b_nopass` | Automatizacion (sin passphrase) |
| `codex_portal_b2b_nopass.pub` | Publica |
| `known_hosts` | Ya contiene `207.180.242.253` |

### Conexion

```powershell
ssh -i C:\Users\DELL\.ssh\codex_portal_b2b root@207.180.242.253
```

## Comandos utiles en el servidor

```bash
# Estado de contenedores
docker ps -a

# Logs de un contenedor
docker logs <nombre> --tail 50

# Entrar a un contenedor
docker exec -it <nombre> /bin/bash

# Migraciones dentro del contenedor Laravel
cd /var/www/html && php artisan migrate

# Optimizar cache
php artisan optimize:clear

# Detener nginx del SO (si estorba)
sudo systemctl stop nginx
sudo systemctl disable nginx
docker restart coolify-proxy
```

## GitHub

### Autenticacion

Se usa HTTPS con un Personal Access Token (PAT) almacenado en Windows Credential Manager.

- Usuario Git: `jrchejab` (`jrchejab@gmail.com`)
- Remote: `https://github.com/jrchejab/<repo>.git`
- Autenticacion: Windows Credential Manager via `credential.helper=manager`
- El PAT tiene permisos para push a repositorios de la cuenta

> **IMPORTANTE (credential manager)**: en la maquina DELL hay varias credenciales de GitHub guardadas (usuarios: `poordesigner`, `jrchejab`, `tachoatomico`, `x-access-token`). Al pushear, git puede usar la equivocada (ej: `poordesigner`) y dar `403 Permission denied`. Para forzar la cuenta correcta, el remote de este proyecto usa el usuario explicito:

```powershell
git remote set-url origin https://jrchejab@github.com/jrchejab/portal_naty.git
```

No hay SSH configurado para GitHub (ssh git@github.com da permission denied).

### Clonar un repositorio

```powershell
$env:Path += ";C:\Program Files\Git\bin"
git clone https://github.com/jrchejab/<repo>.git
```

No se requiere password — el credential manager resuelve la autenticacion.

### Configuracion global Git

- `user.name=jrchejab`
- `user.email=jrchejab@gmail.com`
- `credential.helper=manager`

## Proyecto portal_naty (este repo)

Aplicacion web estatica + backend PHP para CRM/notas. Ver `docs/contexto/portal-naty-estado.md` para el estado completo.

- **Build Pack en Coolify**: `Dockerfile` (imagen `php:8.2-apache`, Apache en el puerto 80). El Dockerfile esta en la raiz del repo.
- **Volumen persistente**: `naty-crm-data` montado en `/var/www/html/data` (RW). Guarda `clientes.json` (CRM) y `calendario_notas.json` (notas del calendario).
- **API**: `api.php` (GET/POST). `api.php` maneja los clientes; `api.php?tipo=calendario` las notas del calendario. Sin volumen, los datos se pierden en cada deploy.
- **Rama**: `master` → produccion (deploy automatico al pushear).
- **Nota**: si `api.php` muestra datos pero el volumen aparece vacio, verificar que el volumen este montado exactamente en `/var/www/html/data` (los archivos quedan en `/var/lib/docker/volumes/naty-crm-data/_data/`).

## Flujo de deploy con Coolify

Coolify hace deploy automatico al pushear a GitHub. No requiere comandos manuales.

1. El proyecto existe en GitHub
2. Coolify esta conectado al repositorio
3. Al pushear a la rama configurada, Coolify construye y despliega

### Ramas tipicas

- `main` → produccion
- `develop` → sandbox / pruebas

El deploy se configura en el panel de Coolify para cada proyecto.

## Stack tipico de servicios

Coolify levanta varios contenedores por proyecto:

- `app` — PHP-FPM / Laravel
- `nginx` — Servidor web del proyecto
- `queue` — Worker de colas
- `scheduler` — Cron de Laravel
- `mysql` — Base de datos
- `redis` — Cache / colas

## Volumen persistente

Para Laravel, montar:

```
/var/www/html/storage/app
```

Tambien conviene respaldar:

```
/var/www/html/storage/logs
```

## Primer despliegue de un proyecto nuevo

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link
```

## Variables de entorno tipicas

| Variable | Descripcion |
|----------|-------------|
| `APP_KEY` | Generar con `php artisan key:generate` |
| `APP_URL` | URL del sitio |
| `DB_DATABASE` | Nombre BD |
| `DB_USERNAME` | Usuario BD |
| `DB_PASSWORD` | Password BD |
| `REDIS_HOST` | Host de Redis |
| `MAIL_*` | Configuracion SMTP (ver Zoho abajo) |
| `FILESYSTEM_DISK` | `local` o `s3` |

## SMTP Zoho

Datos de la cuenta usada para envio de correos del portal:

| Campo | Valor |
|-------|-------|
| Host | `smtppro.zoho.com` |
| Puerto | `587` |
| Encriptacion | TLS |
| Usuario | `b2b@colvapor.com.co` |
| Password | `B2Badmin1435$` |
| FROM address | `b2b@colvapor.com.co` |
| FROM name | `Portal B2B COLVAPOR` |

## Notas

- El proxy Coolify debe manejar SSL/TLS, no configurar certificados manualmente en el contenedor.
- Si hay conflictos de puertos (80/443), verificar que `nginx` del SO no este corriendo.
- Preferir validar cambios directamente en el VPS/contenedor, no en local.
