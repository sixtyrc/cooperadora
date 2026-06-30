# Memoria de Sesión: Fase 8 (Entregas)

**Fecha:** 2026-06-30
**Fase Completada:** 8 - Entregas

## Qué se implementó

### `Delivery`
- Modelo que registra la entrega de un pedido.
- Relación `OneToOneField` con `Order` (un pedido solo se entrega una vez).
- Relación `ForeignKey` con el `User` (operador/admin) que realizó la entrega.
- Campos: `order`, `user`, `delivered_at`, `notes`.
- Al guardar la entrega, automáticamente actualiza el `status` del pedido padre a `entregado`.

### Lógica de Usuario
- El serializador `DeliverySerializer` sobrescribe el método `create()` para inyectar automáticamente el usuario autenticado que está realizando la petición (`request.user`), dejando registro de quién entregó el producto.

## Endpoints

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| GET/POST | `/api/admin/deliveries` | Admin/Operador | Registrar entrega (POST) o listar |
| GET/PUT | `/api/admin/deliveries/<id>` | Admin/Operador | Detalle o edición de entrega |

## Archivos Creados
- `/backend/deliveries/models.py`
- `/backend/deliveries/serializers.py`
- `/backend/deliveries/views.py`
- `/backend/deliveries/urls.py`
- `/backend/deliveries/migrations/0001_initial.py`

## Integración
Se añadió a `settings.py` (`INSTALLED_APPS`) y a `urls.py`.

## Siguientes Pasos
Esperar validación para comenzar **Fase 9 - Reportes**.
