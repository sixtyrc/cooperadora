# Memoria de Sesión: Fase 10 (Frontend Público)

**Fecha:** 2026-06-30
**Fase Completada:** 10 - Frontend Público

## Qué se implementó

### Stack Frontend
- React 19 + TypeScript + Vite 8 + TailwindCSS v4
- react-router-dom 7.18 para routing
- Mobile-first, diseño moderno (Duolingo/Canva insipiración)
- Design System: color `#22C55E`, tipografías Inter/Outfit, redondez máxima (rounded-3xl)

### Pantallas

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/` | Home | Landing con hero, campañas activas, CTA |
| `/campanas` | Campañas | Listado de campañas visibles |
| `/campanas/:slug` | Detalle | Productos de una campaña |
| `/campanas/:slug/pedir` | Pedido | Formulario con selector de productos |
| `/consultar` | Consulta | Búsqueda de pedido por código |

### Componentes

| Componente | Descripción |
|---|---|
| `Layout` | Navbar + Outlet + Footer |
| `Navbar` | Navegación sticky con links activos |
| `Footer` | Pie de página |
| `CampaignCard` | Tarjeta de campaña con imagen hover |
| `ProductCard` | Producto con selector de cantidad (+/-) |

### Funcionalidades
- **Landing page** con hero gradient, campañas destacadas y CTA.
- **Listado de campañas** filtrado por visibilidad (`is_visible`).
- **Detalle de campaña** con grilla de productos.
- **Formulario de pedido** con selector de cantidad, validación y envío a `POST /api/orders`.
- **Consulta de pedido** con búsqueda por código (`PZA-YYYY-NNNNNN`), detalle completo con items y estado.
- **Proxy Vite** configurado para `/api` y `/media` → `localhost:8000`.

### Design System
- **Color primario:** `#22C55E` (verde)
- **Color secundario:** `#16A34A` (verde oscuro)
- **Tipografías:** Inter (cuerpo), Outfit (headings)
- **Bordes:** rounded-2xl / rounded-3xl (máxima redondez)
- **Sombras:** shadow-md, hover:shadow-xl
- **Transiciones:** 300ms ease

## Archivos Creados

### Frontend
- `frontend/src/types/index.ts` — Tipos TypeScript
- `frontend/src/api/client.ts` — Cliente API
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/Footer.tsx`
- `frontend/src/components/CampaignCard.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Campaigns.tsx`
- `frontend/src/pages/CampaignDetail.tsx`
- `frontend/src/pages/OrderForm.tsx`
- `frontend/src/pages/OrderQuery.tsx`

### Archivos Modificados
- `frontend/index.html` — lang="es", Google Fonts, título
- `frontend/vite.config.ts` — proxy /api, /media
- `frontend/src/index.css` — Tailwind theme (colores, tipografías)
- `frontend/src/App.tsx` — Router con 5 rutas
- `frontend/src/main.tsx` — Simplificado

### Eliminados
- `frontend/src/App.css` — Reemplazado por Tailwind

## Comandos

```bash
cd frontend
pnpm install
pnpm run dev      # Desarrollo (localhost:5173)
pnpm run build    # Producción
```

## Siguientes Pasos

Esperar validación para comenzar **Fase 11 - Backoffice**.
