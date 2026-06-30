# Memoria de Sesión: Fases 4 y 5 (Campañas y Productos)

**Fecha:** 2026-06-30
**Fases Completadas:** 4 - Campañas y 5 - Productos

## Qué se implementó

### Campaña (`campaigns`)
- Modelo `Campaign` con: `name`, `slug` (auto), `description`, `image`, `color`, `start_date`, `end_date`, `is_active`, `status`.
- Estados: `draft`, `active`, `finished`, `archived`.
- Propiedad `is_visible` (lógica de visibilidad con fechas).
- Slug autogenerado al guardar desde el nombre.
- **Compresión de imágenes** automática (Pillow, max 1200x1200, JPEG, quality=80).
- API pública (solo visibles) y admin (CRUD completo).

### Producto (`products`)
- Modelo `Product` vinculado a `Campaign` por ForeignKey (related_name=`products`).
- Campos: `campaign`, `name`, `description`, `price`, `image`, `order`, `is_active`.
- Ordering por `order, name`.
- Misma compresión de imágenes reutilizando la función `compress_image` de `campaigns`.
- Endpoint público por slug de campaña: `GET /api/campaigns/<slug>/products`.

## Estructura de Relaciones
```
Campaign (ej: "Julio 2026")
 ├── Product (Delantal)   →  precio individual
 ├── Product (Mochila)    →  precio individual
 └── Product (Ajuar)      →  precio individual

Order (un pedido)
 ├── OrderItem → Product (Delantal) x1
 └── OrderItem → Product (Mochila) x2
 Total = suma automática de ítems

Payment → Order (1 comprobante para todo)
```

## Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/campaigns` | Campañas visibles |
| GET | `/api/campaigns/<slug>` | Detalle público |
| GET | `/api/campaigns/<slug>/products` | Productos activos |
| GET/POST | `/api/admin/campaigns` | Admin |
| GET/PUT/DELETE | `/api/admin/campaigns/<id>` | Admin |
| GET/POST | `/api/admin/products` | Admin |
| GET/PUT/DELETE | `/api/admin/products/<id>` | Admin |

## Archivos Creados
- `/backend/campaigns/models.py`, `serializers.py`, `views.py`, `urls.py`
- `/backend/products/models.py`, `serializers.py`, `views.py`, `urls.py`
- `/backend/campaigns/migrations/0001_initial.py`
- `/backend/products/migrations/0001_initial.py`

## Siguientes Pasos
Esperar validación del usuario para comenzar la **Fase 6 - Pedidos (Orders + OrderItems)**.
