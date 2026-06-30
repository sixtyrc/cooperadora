# Memoria de Sesión: Fase 2 (Seguridad)

**Fecha:** 2026-06-30
**Fase Completada:** 2 - Seguridad

## Qué se implementó
1. **Roles y Autenticación:**
   - Se creó la app `accounts` y un modelo de usuario personalizado (`User`) heredando de `AbstractUser`, con los roles `ADMIN` y `OPERATOR`.
   - Se crearon vistas de autenticación basadas en **Session Authentication** (`LoginView`, `LogoutView`, `UserProfileView`, `CsrfTokenView`).
   - Se incluyó la validación básica para integración futura de Turnstile.
2. **Seguridad (Configuración Django):**
   - Cookies configuradas como seguras, `HttpOnly` y `SameSite=Lax`.
   - HSTS configurado (31536000 segundos, preload, subdomains).
   - Content Security Policy (CSP) manual vía `cooperadora.middleware.CSPMiddleware`.
   - Cabeceras de seguridad: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
   - Rate limiting global mediante DRF (Anon: 20/min, User: 100/min).
3. **Auditoría:**
   - Creación del modelo `AuditLog` en `accounts`.
   - Registro automático de IP y acción en endpoints de `login` y `logout`.

## Archivos Afectados/Creados
- `/backend/cooperadora/settings.py` (Modificado para seguridad y DRF)
- `/backend/cooperadora/middleware.py` (Creado para CSP)
- `/backend/accounts/models.py` (Custom User y AuditLog)
- `/backend/accounts/views.py` (Vistas Session Auth y CSRF)
- `/backend/accounts/urls.py` (Rutas Auth)
- `/backend/cooperadora/urls.py` (Inclusión de `/api/auth/`)
- `/backend/accounts/migrations/0001_initial.py` (Migración generada)

## Siguientes Pasos
Esperar validación del usuario para comenzar la **Fase 3 - Institución**.
