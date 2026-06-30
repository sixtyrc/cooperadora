# Memoria de Sesión: Fase 9 (Reportes)

**Fecha:** 2026-06-30
**Fase Completada:** 9 - Reportes

## Qué se implementó

### App `reports`
- App Django sin modelos propios. Consume datos de `orders`, `payments`, `campaigns` y `products`.
- Permiso personalizado `IsAdminOrOperator` para endpoints protegidos.

### Endpoints

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| GET | `/api/reports/dashboard` | Admin/Operador | Métricas generales (ventas, cobros, pendientes) |
| GET | `/api/reports/campaigns` | Admin/Operador | Resumen por campaña |
| GET | `/api/reports/products` | Admin/Operador | Resumen por producto |
| GET | `/api/reports/classrooms` | Admin/Operador | Resumen por sala |
| GET | `/api/reports/export/excel` | Admin/Operador | Exportar a Excel (.xlsx) |
| GET | `/api/reports/export/pdf` | Admin/Operador | Exportar a PDF |

### Filtros (todos los endpoints de reportes)
- `campaign` — slug de campaña
- `date_from` — fecha inicio (YYYY-MM-DD)
- `date_to` — fecha fin (YYYY-MM-DD)
- `status` — estado del pedido

### Dashboard
- Total de pedidos
- Ventas totales (excluye cancelados)
- Cobros verificados
- Monto pendiente
- Entregas pendientes (pedidos pagados sin entrega)
- Desglose por estado
- Últimos 5 pedidos

### Reportes
- **Por campaña:** pedidos, ventas, cobrado, pendiente.
- **Por producto:** cantidad vendida, ingresos, precio promedio.
- **Por sala:** pedidos, monto total.

### Exportaciones
- **Excel:** 5 hojas (Dashboard, Campañas, Productos, Salas, Últimos pedidos).
- **PDF:** Resumen con tablas de Dashboard, Campañas y Salas.

## Archivos Creados

- `/backend/reports/__init__.py`
- `/backend/reports/apps.py`
- `/backend/reports/models.py`
- `/backend/reports/serializers.py`
- `/backend/reports/views.py`
- `/backend/reports/urls.py`
- `/backend/reports/utils.py`
- `/backend/reports/permissions.py`
- `/backend/reports/tests.py`
- `/backend/reports/migrations/0001_initial.py`

## Archivos Modificados

- `/backend/cooperadora/settings.py` → `reports` en `INSTALLED_APPS`
- `/backend/cooperadora/urls.py` → incluir rutas de reportes
- `/backend/.env` → `DATABASE_URL` con PostgreSQL

## Dependencias Nuevas

| Paquete | Versión |
|---------|---------|
| openpyxl | 3.1.5 |
| reportlab | 5.0.0 |

## Tests

20 tests ejecutados con éxito en PostgreSQL:
- Autenticación (requiere Admin/Operador)
- Dashboard métricas
- Reportes por campaña, producto y sala
- Filtros por fecha, campaña y estado
- Exclusión de pedidos cancelados en ventas
- Exportación Excel y PDF

## Siguientes Pasos

Esperar validación para comenzar **Fase 10 - Frontend Público**.
