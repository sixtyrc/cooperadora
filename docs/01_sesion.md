# COOPERADORA ONLINE — ESTADO DE SESIÓN

**Última actualización:** 2026-06-30

---

## STACK

- Backend: Python 3.13 + Django 6.0.6 + DRF 3.17.1
- Frontend: React 19 + TypeScript + Vite + TailwindCSS v4
- DB: PostgreSQL (dev: SQLite)
- Servidor: Windows Server + NSSM + Caddy + Waitress

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
| 11 - Backoffice | ⏳ Pendiente | — |
| 12 - Producción | ⏳ Pendiente | — |

---

## ESTRUCTURA DE APPS DJANGO

```
backend/
├── cooperadora/
│   ├── settings.py     # Env vars, seguridad, DRF throttling, CORS, MEDIA
│   ├── middleware.py   # CSP headers personalizados
│   └── urls.py         # Router principal (api/)
├── accounts/           # ✅ User con roles, AuditLog, Login/Logout/Me/CSRF
├── institution/        # ✅ Institution singleton, logo, colores, redes
├── campaigns/          # ✅ Campaign con slug auto, compresión imagen, is_visible
├── products/           # ✅ Product por campaña, precio, compresión imagen
├── orders/             # ✅ Order (código PZA-YYYY-NNNNNN), OrderItem
├── payments/           # ✅ Payment con validación tipo/tamaño, UUID rename
├── deliveries/         # ✅ Delivery con registro de operador
└── reports/            # ✅ Dashboard, reportes por campaña/producto/sala, Excel/PDF
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
| POST | `/api/payments` | No | Subir comprobante |
| GET/POST | `/api/admin/campaigns` | Admin | CRUD campañas |
| GET/PUT/DELETE | `/api/admin/campaigns/<id>` | Admin | Detalle campaña |
| GET/POST | `/api/admin/products` | Admin | CRUD productos |
| GET/PUT/DELETE | `/api/admin/products/<id>` | Admin | Detalle producto |
| GET | `/api/admin/orders` | Auth | Listar pedidos |
| GET/PATCH | `/api/admin/orders/<id>` | Auth | Ver/actualizar estado |
| GET | `/api/admin/payments` | Auth | Listar pagos |
| GET/PATCH | `/api/admin/payments/<id>` | Auth | Verificar/rechazar pago |
| GET/POST | `/api/admin/deliveries` | Admin/Operador | Registrar/listar entregas |
| GET/PUT | `/api/admin/deliveries/<id>` | Admin/Operador | Detalle de entrega |
| GET | `/api/reports/dashboard` | Admin/Operador | Dashboard métricas |
| GET | `/api/reports/campaigns` | Admin/Operador | Reporte por campaña |
| GET | `/api/reports/products` | Admin/Operador | Reporte por producto |
| GET | `/api/reports/classrooms` | Admin/Operador | Reporte por sala |
| GET | `/api/reports/export/excel` | Admin/Operador | Exportar a Excel |
| GET | `/api/reports/export/pdf` | Admin/Operador | Exportar a PDF |

---

## DECISIONES TÉCNICAS

- **Singleton Institution:** `get_or_create` con valores por defecto. Solo 1 fila permitida.
- **Compresión de imágenes:** Pillow, max 1200×1200, JPEG quality=80. Se aplica en `Campaign.save()` y `Product.save()`.
- **Slug autogenerado** desde el nombre de la campaña al guardar.
- **Visibilidad de campaña:** `is_active=True AND status='active' AND start_date <= hoy <= end_date`.
- **Código de pedido:** `PZA-YYYY-NNNNNN` (correlativo por año, autogenerado en `Order.save()`).
- **Precio congelado:** `OrderItem.unit_price` se copia del producto al crear el ítem.
- **Total automático:** `Order.total` se recalcula al guardar cada `OrderItem`.
- **Pago único por pedido:** 1 comprobante cubre todos los productos del pedido.
- **Archivos de pago:** renombrados a `UUID.ext`, validados (JPG/PNG/PDF, máx 5MB).
- **Flujo de estados del pedido:**
  - `pendiente` → se crea el pedido
  - `pendiente_pago` → se sube comprobante
  - `pagado` → admin verifica
  - `entregado` → se marca entrega (Fase 8)
  - `cancelado` → manual
- **Session Auth:** Cookies HttpOnly + SameSite=Lax + CSRF. Sin JWT, sin localStorage.
- **Roles:** `ADMIN` (acceso total) y `OPERATOR` (gestiona pedidos/entregas).
- **Rate limiting DRF:** Anon 20/min, User 100/min (Fase 15 agrega throttling específico por endpoint).
- **Stitch MCP:** Proyecto `7397573123013359147` creado. Design System Mobile First: color `#22C55E`, tipografías Inter/Outfit, redondez máxima.

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

---

## DEPENDENCIAS FRONTEND (pnpm)

| Paquete | Versión |
|---------|---------|
| react | 19.2.7 |
| react-dom | 19.2.7 |
| react-router-dom | 7.18.0 |
| typescript | 6.0.3 |
| vite | 8.1.0 |
| tailwindcss | 4.3.1 |
| postcss | 8.5.16 |
| autoprefixer | 10.5.2 |

---

## PRÓXIMOS PASOS

- **Fase 11:** Backoffice (React).
- **Fase 12:** Producción (Caddy + NSSM + Waitress).
