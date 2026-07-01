# Revisión general y endurecimiento

**Fecha:** 2026-06-30  
**Estado:** Completado y validado

## Cambios aplicados

- La consulta pública de pedidos y su PDF requieren código y teléfono coincidentes.
- Los pagos públicos verifican el teléfono, el estado del pedido y evitan pagos pendientes duplicados.
- Los comprobantes se validan por tamaño y contenido real, no sólo por extensión.
- El PDF interno de pago dejó de ser público.
- OCR limitado a 10 solicitudes por minuto y con errores sanitizados.
- Los pedidos validan campaña vigente, producto activo, pertenencia, duplicados y cantidades.
- Sólo se pueden entregar pedidos pagados.
- Los serializers administrativos de pedidos restringen los campos editables.
- Configuración institucional conectada globalmente: nombre, logo, colores, contacto y redes.
- URLs de imágenes normalizadas a `/media/...` para evitar rutas rotas cuando la API devuelve URLs absolutas.
- El formulario de configuración ahora permite subir el logo y refresca la vista al guardar.
- Flujo público simplificado con mensajes claros y formato `COOP-YYYY-NNNNNN`.
- Teléfono público limitado a 10 dígitos, con teclado numérico y ejemplo `3624617500`.
- OCR automático al seleccionar y registrar comprobantes; los campos quedan persistidos para conciliación.
- Conciliación automática por monto, huella del archivo y número de operación, con alertas de duplicados.
- Backoffice de pagos con resumen, filtro y detalle de incidencias de conciliación.
- Grilla de pagos con monto OCR y vista previa clickeable del comprobante.
- Servidor Vite preparado para compartir desarrollo mediante port forwarding en el puerto 5173.
- Alta de usuarios corregida con roles `ADMIN`/`OPERATOR` y errores de validación visibles.
- Se corrigieron advertencias de hooks de React.
- Se agregó la migración pendiente de estados de pedidos.
- CI/CD valida backend y frontend antes de copiar y reiniciar la versión de producción.
- Se agregaron `waitress` y `pytesseract` a las dependencias declaradas.

## Verificación

- `manage.py check`
- `manage.py makemigrations --check --dry-run`
- suite completa de tests
- `pnpm run build`
- `pnpm run lint`
- recorrido de la aplicación levantada en navegador

## Criterio de experiencia pública

No se agregó registro ni contraseña. La persona sólo necesita el código de pedido y el mismo
teléfono que ya informó. Los datos sensibles no quedan accesibles recorriendo códigos correlativos.
