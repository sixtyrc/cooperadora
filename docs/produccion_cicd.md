# Producción y CI/CD — Windows Server

**Última actualización:** 2026-06-30

**Dominio:** `cooperadora.ctsoft.com.ar`
**Rama de despliegue:** `prod`

## Datos definitivos

| Componente | Configuración |
|---|---|
| Proyecto | `C:\www\cooperadora` |
| Backend | Waitress en `127.0.0.1:8004` |
| Base | PostgreSQL `cooperadora_db` |
| Servicio | `cooperadora-backend` |
| Proxy/HTTPS | Caddy + Cloudflare |
| Frontend | `C:\www\cooperadora\frontend\dist` |

Los puertos `8000` a `8003` pertenecen a otros sistemas. No utilizar `8001`
para Cooperadora.

---

## 1. Clonar correctamente la rama `prod`

Ejecutar desde `C:\www`, nunca desde una carpeta `cooperadora` preexistente:

```powershell
cd C:\www
git clone --branch prod --single-branch https://github.com/sixtyrc/cooperadora.git C:\www\cooperadora
cd C:\www\cooperadora
git status
```

El resultado debe indicar `On branch prod`. No ejecutar `git switch -c prod`.

Si una clonación fallida dejó la carpeta bloqueada, abrir PowerShell como
administrador, salir de esa carpeta y recién entonces eliminarla:

```powershell
cd C:\
takeown /F C:\www\cooperadora /R /D Y
icacls C:\www\cooperadora /grant "${env:USERNAME}:(OI)(CI)F" /T
Remove-Item C:\www\cooperadora -Recurse -Force
```

---

## 2. Instalar Python 3.13 sin `winget`

Windows Server puede no incluir `winget` y PowerShell puede necesitar TLS 1.2:

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
New-Item C:\Temp -ItemType Directory -Force
Invoke-WebRequest "https://www.python.org/ftp/python/3.13.13/python-3.13.13-amd64.exe" -OutFile "C:\Temp\python313.exe"
Start-Process "C:\Temp\python313.exe" -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_launcher=1" -Wait
```

Cerrar y abrir PowerShell. Verificar:

```powershell
py -3.13 --version
```

Crear el entorno e instalar dependencias:

```powershell
cd C:\www\cooperadora\backend
py -3.13 -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe --version
```

---

## 3. Crear PostgreSQL

En pgAdmin, conectado a la base `postgres`, activar **Auto-commit**. Ejecutar
cada sentencia por separado:

```sql
CREATE USER cooperadora_user WITH PASSWORD 'REEMPLAZAR_POR_PASSWORD_SEGURA';
```

```sql
CREATE DATABASE cooperadora_db OWNER cooperadora_user;
```

`CREATE DATABASE` no puede ejecutarse dentro de un bloque de transacción.
Asignar `OWNER` evita necesitar un `GRANT` adicional.

### Descubrir el puerto real

No asumir que PostgreSQL usa `5432`:

```powershell
Get-Service *postgres*
Get-NetTCPConnection -State Listen |
Where-Object OwningProcess -In (Get-Process postgres).Id |
Select-Object LocalAddress,LocalPort,OwningProcess
```

En este servidor se detectó `9857`. Usar el puerto que devuelva el comando.

---

## 4. Crear `.env` sin BOM

Generar una clave nueva:

```powershell
cd C:\www\cooperadora\backend
$secret = .\venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(50))"
```

Crear `C:\www\cooperadora\backend\.env` con estos valores, reemplazando
password y puerto:

```env
SECRET_KEY=CLAVE_GENERADA
DEBUG=False
ALLOWED_HOSTS=cooperadora.ctsoft.com.ar,localhost,127.0.0.1

DATABASE_URL=postgresql://cooperadora_user:PASSWORD@localhost:9857/cooperadora_db

SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
# Caddy realiza la redirección pública a HTTPS. Waitress permanece en HTTP local.
SECURE_SSL_REDIRECT=False
CSRF_TRUSTED_ORIGINS=https://cooperadora.ctsoft.com.ar
CORS_ALLOWED_ORIGINS=https://cooperadora.ctsoft.com.ar
```

Si se creó con Notepad, quitar el BOM para evitar `Invalid line: ï»¿SECRET_KEY`:

```powershell
$path = "C:\www\cooperadora\backend\.env"
$content = Get-Content $path
[System.IO.File]::WriteAllLines($path, $content, (New-Object System.Text.UTF8Encoding($false)))
```

No publicar `.env`. Si la contraseña contiene `@`, `:`, `/`, `#` o `%`, debe
codificarse para una URL.

---

## 5. Inicializar Django

```powershell
cd C:\www\cooperadora\backend
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py collectstatic --noinput
.\venv\Scripts\python.exe manage.py createsuperuser
```

Si aparece `connection refused`, revisar el puerto de PostgreSQL en
`DATABASE_URL`.

---

## 6. Instalar pnpm y compilar React

Requiere Node.js. Verificar:

```powershell
node --version
npm --version
```

Instalar pnpm:

```powershell
npm install --global pnpm
$npmGlobal = npm prefix -g
$env:Path += ";$npmGlobal"
& "$npmGlobal\pnpm.cmd" --version
```

Compilar:

```powershell
cd C:\www\cooperadora\frontend
& "$npmGlobal\pnpm.cmd" install --frozen-lockfile
& "$npmGlobal\pnpm.cmd" build
Test-Path C:\www\cooperadora\frontend\dist\index.html
```

El último comando debe devolver `True`.

---

## 7. Crear servicio NSSM

Abrir PowerShell como administrador:

```powershell
New-Item C:\www\cooperadora\logs -ItemType Directory -Force
nssm install cooperadora-backend C:\www\cooperadora\backend\venv\Scripts\python.exe "-m waitress --listen=127.0.0.1:8004 --threads=4 cooperadora.wsgi:application"
nssm set cooperadora-backend AppDirectory C:\www\cooperadora\backend
nssm set cooperadora-backend Start SERVICE_AUTO_START
nssm set cooperadora-backend AppStdout C:\www\cooperadora\logs\backend-out.log
nssm set cooperadora-backend AppStderr C:\www\cooperadora\logs\backend-error.log
nssm start cooperadora-backend
nssm status cooperadora-backend
```

Debe responder `SERVICE_RUNNING`. Probar:

```powershell
Invoke-WebRequest http://127.0.0.1:8004/api/institution -UseBasicParsing -TimeoutSec 10
```

---

## 8. Agregar sitio a Caddy

Agregar este bloque al Caddyfile existente:

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

No agregar `handle /admin/*`: `/admin` es el backoffice React y debe llegar al
frontend. El backoffice consume Django mediante `/api`.

Validar antes de recargar:

```powershell
caddy validate --config C:\caddy\Caddyfile
caddy reload --config C:\caddy\Caddyfile
```

---

## 9. Configurar Cloudflare

En **DNS → Records**:

- Tipo: `A`
- Nombre: `cooperadora`
- Contenido: IP pública del servidor
- Proxy: activado (nube naranja)
- TTL: Auto

En **SSL/TLS**, seleccionar `Full (strict)`.

Sólo exponer `80` y `443`. El puerto `8004` escucha en `127.0.0.1` y no debe
abrirse en el firewall.

---

## 10. Instalar GitHub Actions Runner

En GitHub:

**Repositorio → Settings → Actions → Runners → New self-hosted runner →
Windows x64**.

Crear una carpeta exclusiva, por ejemplo:

```powershell
New-Item C:\actions-runner\cooperadora -ItemType Directory -Force
cd C:\actions-runner\cooperadora
```

Ejecutar los comandos de descarga y configuración que muestra GitHub. Para
instalarlo como servicio en Windows:

```powershell
.\svc.cmd install
.\svc.cmd start
.\svc.cmd status
```

No usar `svc.sh`; ese comando corresponde a Linux.

---

## 11. Deploy automático

El workflow `.github/workflows/deploy.yml` se ejecuta con cada push a `prod`:

1. Descarga la revisión.
2. Instala dependencias.
3. Ejecuta checks y 30 tests del backend.
4. Compila y verifica el frontend.
5. Copia la versión validada a `C:\www\cooperadora`.
6. Aplica migraciones y recolecta estáticos.
7. Reinicia `cooperadora-backend`.
8. Verifica `http://localhost:8004/api/institution`.

Flujo recomendado desde desarrollo:

```powershell
git switch main
git add .
git commit -m "Descripción del cambio"
git push origin main
git switch prod
git merge main
git push origin prod
git switch main
```

También puede hacerse mediante Pull Request `main → prod`.

---

## Checklist final

- [ ] Rama `prod` clonada en `C:\www\cooperadora`
- [ ] Python 3.13 y `venv` creados
- [ ] Dependencias backend instaladas
- [ ] PostgreSQL activo y puerto real identificado
- [ ] Base y propietario creados
- [ ] `.env` creado sin BOM
- [ ] Migraciones y superusuario completados
- [ ] pnpm instalado y `dist/index.html` generado
- [ ] NSSM en `127.0.0.1:8004` y `SERVICE_RUNNING`
- [ ] Caddy validado y recargado
- [ ] DNS Cloudflare creado y SSL `Full (strict)`
- [ ] Runner conectado y ejecutándose como servicio
- [ ] Primer push a `prod` completado correctamente
