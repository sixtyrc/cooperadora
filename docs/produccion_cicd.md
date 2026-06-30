# Guía de Producción y CI/CD

**Fecha:** 2026-06-30

---

## Infraestructura del Servidor

- **OS:** Windows Server
- **Ruta del proyecto:** `C:\www\cooperadora`
- **Puerto Django:** `8004` (Waitress; 8000–8003 ya están ocupados por otros sistemas)
- **Proxy:** Caddy (HTTPS automático)
- **Servicios:** NSSM

---

## SETUP INICIAL (una sola vez)

### 1. Clonar el repositorio

```powershell
cd C:\www
git clone https://github.com/sixtyrc/cooperadora cooperadora
cd cooperadora
```

### 2. Entorno virtual Python

```powershell
cd C:\www\cooperadora\backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Crear base de datos PostgreSQL

```sql
CREATE DATABASE cooperadora_db;
CREATE USER cooperadora_user WITH PASSWORD 'clave_segura';
GRANT ALL PRIVILEGES ON DATABASE cooperadora_db TO cooperadora_user;
```

### 4. Crear archivo `.env`

Crear `C:\www\cooperadora\backend\.env`:

```env
SECRET_KEY=clave-secreta-larga-y-aleatoria
DEBUG=False
ALLOWED_HOSTS=cooperadora.ctsoft.com.ar,localhost,127.0.0.1

DATABASE_URL=postgresql://cooperadora_user:clave_segura@localhost:5432/cooperadora_db

SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
CSRF_TRUSTED_ORIGINS=https://cooperadora.ctsoft.com.ar
CORS_ALLOWED_ORIGINS=https://cooperadora.ctsoft.com.ar
```

> ⚠️ El archivo `.env` NUNCA debe subirse al repositorio. Está en `.gitignore`.

### 5. Migraciones y superusuario

```powershell
cd C:\www\cooperadora\backend
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py collectstatic --noinput
.\venv\Scripts\python.exe manage.py createsuperuser
```

### 6. Crear servicio NSSM

```powershell
nssm install cooperadora-backend
# Configurar en el editor:
#   Path:        C:\www\cooperadora\backend\venv\Scripts\python.exe
#   Arguments:   -m waitress --listen=127.0.0.1:8004 --threads=4 cooperadora.wsgi:application
#   Startup dir: C:\www\cooperadora\backend

nssm start cooperadora-backend
```

### 7. Configurar Caddy

Agregar al `Caddyfile` existente:

```caddy
cooperadora.ctsoft.com.ar {
    encode gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:8004 {
            header_up X-Forwarded-Proto {scheme}
        }
    }

    handle_path /static/* {
        root * "C:/www/cooperadora/backend/staticfiles"
        file_server
    }

    handle_path /media/* {
        root * "C:/www/cooperadora/backend/media"
        file_server
    }

    handle {
        root * "C:/www/cooperadora/frontend/dist"
        try_files {path} /index.html
        file_server
    }

    log {
        output file C:\caddy\logs\cooperadora.log
        level INFO
    }
}
```

```powershell
caddy reload --config C:\ruta\Caddyfile
```

> No agregar un `handle /admin/*`: el backoffice React usa rutas `/admin` y debe
> caer en el `handle` del frontend. Toda su comunicación backend utiliza `/api`.

### 7.1 Configurar Cloudflare

En **DNS → Records**:

- Tipo: `A`
- Nombre: `cooperadora`
- Contenido: IP pública del servidor
- Proxy: activado (nube naranja)
- TTL: Auto

En **SSL/TLS** seleccionar `Full (strict)`. Los puertos públicos necesarios son
`80` y `443`; el `8004` queda escuchando sólo en `127.0.0.1` y no debe abrirse
en el firewall.

### 8. Build inicial del frontend

```powershell
cd C:\www\cooperadora\frontend
pnpm install --frozen-lockfile
pnpm build
```

### 9. Instalar Self-Hosted Runner de GitHub

1. Ir a: **GitHub → sixtyrc/cooperadora → Settings → Actions → Runners → New self-hosted runner**
2. Seleccionar: **Windows / x64**
3. Ejecutar los comandos que provee GitHub (tienen el token incluido):

```powershell
./config.cmd --url https://github.com/sixtyrc/cooperadora --token TOKEN_DE_GITHUB --name "win-server-cooperadora" --unattended
.\svc.sh install
.\svc.sh start
```

### 10. Crear rama `production`

```powershell
git checkout -b production
git push origin production
```

---

## CI/CD AUTOMÁTICO

El archivo `.github/workflows/deploy.yml` ya está en el repositorio.

Antes de publicar, el workflow ejecuta checks y tests del backend, build y lint del
frontend. Sólo después copia la versión validada a `C:\www\cooperadora`, aplica
migraciones, recolecta estáticos y reinicia el servicio.

### Flujo de deploy

```
git push origin production
       ↓
GitHub Actions detecta el push
       ↓
Self-Hosted Runner (Windows Server)
       ↓
pip install + migrate + collectstatic + nssm restart
       ↓
pnpm install + pnpm build
       ↓
Health check en localhost:8004
       ↓
✅ Deploy completado
```

### Pasos para deployar

```bash
# Opción 1: directo
git checkout production
git merge main
git push origin production

# Opción 2: Pull Request en GitHub (recomendado)
# main → production (con revisión de código)
```

---

## Proteger la rama `production`

En **GitHub → Settings → Branches → Add branch protection rule**:
- Branch name: `production`
- ✅ Require pull request reviews before merging
- ✅ Restrict who can push to matching branches

---

## Checklist de Setup

- [ ] Clonar repo en `C:\www\cooperadora`
- [ ] Crear venv y `pip install -r requirements.txt`
- [ ] Crear DB PostgreSQL y usuario
- [ ] Crear archivo `.env` con variables de producción
- [ ] Ejecutar `migrate` + `collectstatic` + `createsuperuser`
- [ ] Crear servicio NSSM `cooperadora-backend` en puerto `8004`
- [ ] Configurar Caddy y recargar
- [ ] Build inicial del frontend (`pnpm build`)
- [ ] Instalar Self-Hosted Runner de GitHub como servicio Windows
- [ ] Crear rama `production` y hacer push
- [ ] Verificar primer deploy automático en GitHub Actions
