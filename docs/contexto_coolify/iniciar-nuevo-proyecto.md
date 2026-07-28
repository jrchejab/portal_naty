# Checklist — Iniciar un nuevo proyecto en Coolify

Pasos rapidos para arrancar un proyecto nuevo en el VPS `207.180.242.253`.

---

## 1. Repositorio

- Crear repo en GitHub (ej: `jrchejab/nuevo-proyecto`)
- Autenticacion: HTTPS con PAT en Windows Credential Manager (usuario `jrchejab`)
- No requiere password manual — el credential manager resuelve el token
- Clonar localmente:

```powershell
$env:Path += ";C:\Program Files\Git\bin"
git clone https://github.com/jrchejab/<repo>.git
```

- Configurar Git si es primera vez:

```powershell
git config --global user.name "jrchejab"
git config --global user.email "jrchejab@gmail.com"
git config --global credential.helper manager
```

- Rama `main` para produccion, `develop` para desarrollo

## 2. Coolify — Agregar proyecto

- En el panel de Coolify, crear nuevo proyecto
- Conectar repositorio GitHub
- Configurar rama de deploy (`main` o `develop`)
- Coolify detecta `docker-compose.yml` o permite configurar servicios manualmente

## 3. Stack de servicios

Agregar segun necesidad:

- `app` — PHP-FPM / Laravel
- `nginx` — Servidor web
- `queue` — Worker de colas
- `scheduler` — Cron
- `mysql` — Base de datos
- `redis` — Cache / colas

## 4. Variables de entorno

Configurar en Coolify: `APP_KEY`, `APP_URL`, `DB_*`, `MAIL_*`, etc.

## 5. Volumen persistente

Montar `storage/app` para archivos subidos.

## 6. Primer deploy

Coolify construye automaticamente. Despues del primer build:

```bash
# Entrar al contenedor app
docker exec -it <proyecto>-app-1 /bin/bash

# Comandos iniciales
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link
```

## 7. Dominio y SSL

- Configurar dominio en Coolify
- Coolify Proxy maneja SSL automaticamente

## 8. SSH

Usar la llave `C:\Users\DELL\.ssh\codex_portal_b2b` para conexion directa:

```powershell
ssh -i C:\Users\DELL\.ssh\codex_portal_b2b root@207.180.242.253
```

Si el servidor no esta en `known_hosts`, se agregara automaticamente al confirmar la huella.

---

Ver documento `servidor-y-despliegue.md` para mas detalles.
