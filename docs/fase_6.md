# Memoria de Sesión: Fase 6 (Pedidos)

**Fecha:** 2026-06-30
**Fase Completada:** 6 - Pedidos

## Qué se implementó

### `Order`
- Código autogenerado formato `PZA-2026-000001` (correlativo por año).
- Campos: `campaign`, `code`, `customer_name`, `phone`, `student_name`, `classroom`, `notes`, `total`, `status`.
- Estados: `pendiente`, `pendiente_pago`, `pagado`, `entregado`, `cancelado`.
- Método `recalculate_total()` que suma los subtotales de todos los `OrderItem` asociados.

### `OrderItem`
- FK a `Order` (related_name=`items`) y FK a `Product`.
- Captura `unit_price` al momento del pedido (no cambia si el producto cambia de precio después).
- Calcula `subtotal = unit_price * quantity` automáticamente al guardar.
- Dispara `recalculate_total()` en el `Order` padre al guardar.

## Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/orders` | Crear pedido (público) |
| GET | `/api/orders/<code>` | Consultar pedido por código (público) |
| GET | `/api/admin/orders` | Listar todos (backoffice) |
| GET/PATCH | `/api/admin/orders/<id>` | Ver/actualizar estado (backoffice) |

## Archivos Creados
- `/backend/orders/models.py`
- `/backend/orders/serializers.py`
- `/backend/orders/views.py`
- `/backend/orders/urls.py`
- `/backend/orders/migrations/0001_initial.py`

## Siguientes Pasos
Esperar validación para comenzar **Fase 7 - Pagos**.
