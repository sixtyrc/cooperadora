# ROADMAP DE DESARROLLO

---

# FASE 1 — ARQUITECTURA

Crear:
- proyecto Django.
- DRF.
- PostgreSQL.
- React.
- Tailwind.
- variables de entorno.

No implementar funcionalidades.

---

# FASE 2 — SEGURIDAD

Implementar:
- login.
- logout.
- roles.
- CSRF.
- CSP.
- HSTS.
- Cookies seguras.
- auditoría.

Roles:
- Administrador.
- Operador.

---

# FASE 3 — INSTITUCIÓN

Crear:
Institution.

Campos:
- nombre.
- logo.
- colores.
- teléfono.
- WhatsApp.
- dirección.
- redes.
- mensaje.

---

# FASE 4 — CAMPAÑAS

Modelo:
Campaign.

Campos:
- nombre.
- slug.
- descripción.
- imagen.
- fecha_inicio.
- fecha_fin.
- activa.
- estado.

Estados:
- borrador.
- activa.
- finalizada.
- archivada.

---

# FASE 5 — PRODUCTOS

Modelo:
Product.

Campos:
- campaña.
- nombre.
- descripción.
- precio.
- imagen.
- orden.
- activo.

---

# FASE 6 — PEDIDOS

Modelo:
Order.

Campos:
- código.
- nombre.
- teléfono.
- alumno.
- sala.
- observaciones.
- total.
- estado.

Estados:
- pendiente.
- pendiente_pago.
- pagado.
- entregado.
- cancelado.

Modelo:
OrderItem.

---

# FASE 7 — PAGOS

Modelo:
Payment.

Campos:
- pedido.
- método.
- comprobante.
- estado.

Métodos:
- transferencia.
- efectivo.

Archivos:
- JPG.
- PNG.
- PDF.

Máximo:
5 MB.

---

# FASE 8 — ENTREGAS

Modelo:
Delivery.

Campos:
- pedido.
- fecha.
- usuario.

---

# FASE 9 — REPORTES

Dashboard:
- ventas.
- cobros.
- pendientes.

Reportes:
- campañas.
- productos.
- salas.

Exportar:
- Excel.
- PDF.

---

# FASE 10 — FRONTEND PÚBLICO

Pantallas:
- Home.
- Campañas.
- Detalle.
- Pedido.
- Consulta.

Diseño:
- landing page.
- tarjetas.
- ilustraciones.
- animaciones.

---

# FASE 11 — BACKOFFICE

Pantallas:
- Dashboard.
- Campañas.
- Productos.
- Pedidos.
- Pagos.
- Entregas.
- Reportes.
- Configuración.
- Usuarios.
- Auditoría.

---

# FASE 12 — PRODUCCIÓN

Configurar:
- Waitress.
- NSSM.
- Caddy.
- HTTPS.
- Logs.
- Backups.

Generar:
- ejemplo Caddyfile.
- instalación NSSM.
- guía producción.

---

# REGLA

No avanzar a la siguiente fase sin validación del usuario.
