# COOPERADORA ONLINE — ESTADO DE SESIÓN

**Última actualización:** 2026-06-30 (OCR, PDFs, auditoría, entregas redesign)

---

## STACK

- Backend: Python 3.13 + Django 6.0.6 + DRF 3.17.1
- Frontend: React 19 + TypeScript + Vite + TailwindCSS v4
- DB: PostgreSQL 15 (`cooperadora`, usuario `avicola`)
- Servidor: Windows Server + NSSM + Caddy + Waitress
- OCR: Tesseract 5.5 + pytesseract

---

## ESTADO DE FASES

| Fase | Estado | Memoria |
|------|--------|---------|
| 1 - Arquitectura | ✅ Completada | `fase_1.md` |
| 2 - Seguridad | ✅ Completada | `fase_2.md` |
| 3 - Institución | ✅ Completada | `fase_3.md` |
| 4 - Campañas | ✅ Completada | `fase_4_5.md` |
| 5 - Productos | ✅ Completada | `fase_4_5.md` |
| 6 - Pedidos | ✅ Completada | `fase_6.md` |
| 7 - Pagos | ✅ Completada | `fase_7.md` |
| 8 - Entregas | ✅ Completada | `fase_8.md` |
| 9 - Reportes | ✅ Completada | `fase_9.md` |
| 10 - Frontend Público | ✅ Completada | `fase_10.md` |
| 11 - Backoffice | ✅ Completada | `fase_11.md` |
| 12 - Producción | ⏳ Pendiente | — |

---

## ESTRUCTURA DE APPS DJANGO

```
backend/
├── cooperadora/
│   ├── settings.py     # Env vars, seguridad, DRF throttling, CORS, MEDIA
│   ├── middleware.py   # CSP headers personalizados
│   └── urls.py         # Router principal (api/) + media files
├── accounts/           # ✅ User con roles, AuditLog, Login/Logout/Me/CSRF, audit helper
├── institution/        # ✅ Institution singleton, logo, colores, redes
├── campaigns/          # ✅ Campaign con slug auto, compresión imagen, is_visible
├── products/           # ✅ Product por campaña, precio, costo, compresión imagen
├── orders/             # ✅ Order (código COOP-YYYY-NNNNNN), OrderItem, PDF, delivery check
├── payments/           # ✅ Payment con OCR, validación, UUID rename, compresión, PDF comprobante
├── deliveries/         # ✅ Delivery checklist toggle con auditoría
└── reports/            # ✅ Dashboard, reportes por campaña/producto/sala, Excel/PDF, financiero
```

---

## ENDPOINTS ACTUALES

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| GET | `/api/auth/csrf` | No | Cookie CSRF |
| POST | `/api/auth/login` | No | Login session |
| POST | `/api/auth/logout` | Sí | Logout |
| GET | `/api/auth/me` | Sí | Perfil usuario |
| GET | `/api/institution` | No | Config institucional |
| PUT/PATCH | `/api/institution` | Admin | Editar institución |
| GET | `/api/campaigns` | No | Campañas visibles |
| GET | `/api/campaigns/<slug>` | No | Detalle campaña |
| GET | `/api/campaigns/<slug>/products` | No | Productos de campaña |
| POST | `/api/orders` | No | Crear pedido |
| GET | `/api/orders/<code>` | No | Consulta por código |
| GET | `/api/orders/<code>/pdf` | No | Descargar PDF del pedido |
| POST | `/api/payments` | No | Subir comprobante (con datos OCR) |
| GET | `/api/payments/<id>/pdf` | No | Descargar comprobante de pago |
| POST | `/api/payments/ocr` | No | OCR de comprobante (extrae datos) |
| GET/POST | `/api/admin/campaigns` | Admin | CRUD campañas |
| GET/PUT/DELETE | `/api/admin/campaigns/<id>` | Admin | Detalle campaña + auditoría |
| GET/POST | `/api/admin/products` | Admin | CRUD productos |
| GET/PUT/DELETE | `/api/admin/products/<id>` | Admin | Detalle producto + auditoría |
| GET | `/api/admin/orders` | Auth | Listar pedidos con filtros |
| GET/PATCH | `/api/admin/orders/<id>` | Auth | Ver/actualizar estado + auditoría |
| GET/PATCH | `/api/admin/orders/delivery-check` | Auth | Checklist de entregas toggle |
| GET | `/api/admin/payments` | Auth | Listar pagos con filtros |
| GET/PATCH | `/api/admin/payments/<id>` | Auth | Verificar/rechazar pago + auditoría |
| GET/POST | `/api/admin/deliveries` | Auth | Registrar/listar entregas |
| GET/POST | `/api/admin/users` | Admin | Listar/crear usuarios |
| GET/PUT/PATCH/DELETE | `/api/admin/users/<id>` | Admin | Gestión de usuario |
| GET | `/api/admin/audit` | Admin | Logs de auditoría |
| GET | `/api/reports/dashboard` | Auth | Dashboard métricas |
| GET | `/api/reports/campaigns` | Auth | Reporte por campaña |
| GET | `/api/reports/products` | Auth | Reporte por producto |
| GET | `/api/reports/classrooms` | Auth | Reporte por sala |
| GET | `/api/reports/export/excel` | Auth | Exportar a Excel |
| GET | `/api/reports/export/pdf` | Auth | Exportar a PDF |
| GET | `/api/reports/financial` | Auth | Reporte financiero (costo/ganancia) |

---

## DECISIONES TÉCNICAS

- **Singleton Institution:** `get_or_create` con valores por defecto. Solo 1 fila permitida.
- **Compresión de imágenes:** Pillow, max 1200×1200, JPEG quality=80. Se aplica en `Campaign.save()`, `Product.save()` y `Payment.save()`.
- **Slug autogenerado** desde el nombre de la campaña al guardar.
- **Visibilidad de campaña:** `is_active=True AND status='active' AND start_date <= hoy <= end_date`.
- **Código de pedido:** `COOP-YYYY-NNNNNN` (correlativo por año, autogenerado en `Order.save()`).
- **Precio congelado:** `OrderItem.unit_price` se copia del producto al crear el ítem.
- **Costo de producto:** Campo `cost` en Product (migration 0002). Se usa para calcular ganancia y reporte financiero.
- **Total automático:** `Order.total` se recalcula al guardar cada `OrderItem`.
- **Pago único por pedido:** 1 comprobante cubre todos los productos del pedido.
- **Archivos de pago:** renombrados a `UUID.ext`, validados (JPG/PNG/PDF, máx 5MB). Compresión automática a JPEG.
- **OCR de comprobantes:** Tesseract OCR extrae nombre, DNI/CUIL, monto, fecha, nro de operación. Datos se guardan en modelo Payment.
- **PDF de pedido:** Generado con ReportLab, formato visual con colores, footer "Desarrollado por ctsoft.com.ar".
- **PDF de comprobante:** Generado con ReportLab, muestra datos del pago y estado de verificación.
- **Flujo de estados del pedido:**
  - `pendiente` → se crea el pedido
  - `pendiente_pago` → se sube comprobante (muestra "Verificando Pago")
  - `pagado` → admin verifica
  - `entregado` → se marca entrega via checklist
  - `cancelado` → manual
- **Session Auth:** Cookies HttpOnly + SameSite=Lax + CSRF. Sin JWT, sin localStorage.
- **CSRF fix:** `CSRF_COOKIE_HTTPONLY=False` para que JS lea la cookie, `CSRF_TRUSTED_ORIGINS` para el proxy Vite, y `X-CSRFToken` header en cada POST.
- **Roles:** `ADMIN` (acceso total) y `OPERATOR` (gestiona pedidos/entregas).
- **Auditoría:** Todas las acciones importantes se registran en `AuditLog`: login/logout, verificar/rechazar pago, cambiar estado pedido, crear/editar/eliminar campañas/productos, marcar/desmarcar entregas.
- **Entregas redesign:** Grilla con checkboxes toggle (entregado/no entregado), búsqueda full-text por nombre, filtros por campaña, resumen de contadores.
- **Imágenes en productos/campañas:** Formularios admin con upload, compresión automática, fallback a emoji en página pública.
- **Filtros admin:** Todas las pantallas tienen filtros por campaña, fecha, estado según corresponda.

---

## DEPENDENCIAS BACKEND

| Paquete | Versión |
|---------|---------|
| Django | 6.0.6 |
| djangorestframework | 3.17.1 |
| psycopg2-binary | 2.9.12 |
| django-environ | 0.14.0 |
| django-cors-headers | 4.9.0 |
| Pillow | 12.2.0 |
| openpyxl | 3.1.5 |
| reportlab | 5.0.0 |
| pytesseract | 0.3.13 |

---

## DEPENDENCIAS FRONTEND

| Paquete | Versión |
|---------|---------|
| react | 19.2.7 |
| react-dom | 19.2.7 |
| react-router-dom | 7.18.0 |
| typescript | 6.0.3 |
| vite | 8.1.0 |
| tailwindcss | 4.3.1 |

---

## PRÓXIMOS PASOS

- **Fase 12:** Producción (Caddy + NSSM + Waitress).
