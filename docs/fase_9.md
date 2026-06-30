# Memoria de Sesión: Fase 9 (Reportes)

**Fecha:** 2026-06-30
**Fase Completada:** 9 - Reportes

## Qué se implementó

### `Reports` (Generación de Reportes)
- Dashboard con estadísticas de:
  - Total vendido, cobrado, y pendiente.
  - Cantidad de pedidos en cada estado.
- Reportes agregados:
  - **Por campaña:** ventas totales, estado de cobranza y cantidad de pedidos.
  - **Por producto:** unidades vendidas, ingresos generados.
  - **Por sala (Classroom):** cantidad de alumnos que pidieron y total.
- Exportación:
  - `Excel` utilizando `openpyxl`.
  - `PDF` utilizando `reportlab`.

## Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/reports/dashboard` | Indicadores generales |
| GET | `/api/reports/campaigns` | Datos agregados por campaña |
| GET | `/api/reports/products` | Datos agregados por producto |
| GET | `/api/reports/classrooms`| Datos agregados por sala |
| GET | `/api/reports/export/excel` | Descarga archivo Excel `.xlsx` |
| GET | `/api/reports/export/pdf` | Descarga archivo PDF `.pdf` |

*(Todos los endpoints requieren estar autenticado como Admin u Operador)*

## Archivos Utilizados/Actualizados
- `/backend/reports/utils.py` (Lógica de agrupación y generación de archivos).
- `/backend/reports/views.py` (API views).
- `/backend/cooperadora/settings.py` (Agregado `reports` a `INSTALLED_APPS`).
- `/backend/cooperadora/urls.py` (Agregado `reports.urls`).

## Siguientes Pasos
Esperar validación para comenzar **Fase 10 - Frontend Público**.
