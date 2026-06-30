# Memoria de Sesión: Fase 3 (Institución)

**Fecha:** 2026-06-30
**Fase Completada:** 3 - Institución

## Qué se implementó
1. **App Institución:**
   - Se creó la app `institution`.
   - Se definió el modelo `Institution` con campos de `name`, `logo`, `primary_color`, `secondary_color`, `phone`, `whatsapp`, `address`, `social_links` (JSONField) y `welcome_message`.
   - Se implementó la lógica en el método `save()` del modelo para asegurar que exista una sola instancia de configuración institucional en la base de datos (Singleton approach).
2. **API REST:**
   - Se creó el `InstitutionSerializer`.
   - Se implementó `InstitutionView` en base a un `RetrieveUpdateAPIView`.
   - La vista retorna la instancia única, creándola con valores por defecto si no existe (`get_or_create`).
   - Se agregó la validación de roles (`IsAdminOrReadOnly`) para asegurar que solo los administradores puedan editar los colores, logos y mensajes, mientras que el resto puede consumir los datos libremente de forma segura.
3. **Dependencias:**
   - Se instaló la librería `Pillow` en el entorno virtual requerida para que el campo `ImageField` del logo funcionara.

## Archivos Creados/Modificados
- `/backend/cooperadora/settings.py` (Se añadió `institution` a INSTALLED_APPS y se definió `MEDIA_ROOT` y `MEDIA_URL`)
- `/backend/institution/models.py` (Creación del modelo)
- `/backend/institution/serializers.py` (Creación del serializador)
- `/backend/institution/views.py` (API views con permisos)
- `/backend/institution/urls.py` (Rutas)
- `/backend/cooperadora/urls.py` (Inclusión `/api/institution`)
- `/backend/institution/migrations/0001_initial.py` (Migración generada)
- `/docs/fase_3.md` (Este documento)

## Siguientes Pasos
Esperar validación del usuario para comenzar con la **Fase 4 - Campañas**.
