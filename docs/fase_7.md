# Memoria de Sesión: Fase 7 (Pagos)

**Fecha:** 2026-06-30
**Fase Completada:** 7 - Pagos

## Qué se implementó

### `Payment`
- FK a `Order` (un pedido puede tener varios intentos de pago).
- Métodos: `transferencia`, `efectivo`.
- Estados: `pendiente`, `verificado`, `rechazado`.
- Campo `voucher`: archivo renombrado automáticamente a `UUID.ext` (función `voucher_upload_path`).

### Validaciones (serializer)
- Extensiones permitidas: `JPG`, `JPEG`, `PNG`, `PDF`.
- Tamaño máximo: **5 MB**.

### Lógica de negocio (views)
- Al crear un pago (cualquier método) → pedido pasa a `pendiente_pago`.
- Al verificar el comprobante (admin) → pedido pasa a `pagado`.
- Al rechazar el comprobante (admin) → pedido vuelve a `pendiente`.

## Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/payments` | Subir comprobante (público, multipart) |
| GET | `/api/admin/payments` | Listar pagos (backoffice) |
| GET/PATCH | `/api/admin/payments/<id>` | Ver/verificar pago |

## Archivos Creados
- `/backend/payments/models.py`
- `/backend/payments/serializers.py`
- `/backend/payments/views.py`
- `/backend/payments/urls.py`
- `/backend/payments/migrations/0001_initial.py`

## Siguientes Pasos
Esperar validación para comenzar **Fase 8 - Entregas**.
