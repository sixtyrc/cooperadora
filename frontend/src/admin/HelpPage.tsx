export default function HelpPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">Manual Operativo</h1>

      <div className="max-w-3xl space-y-6">
        <Section title="Dashboard">
          <p>Pantalla principal que muestra las métricas clave: total de pedidos, ventas totales, cobros verificados, monto pendiente y entregas pendientes.</p>
          <p>Los últimos 5 pedidos aparecen en la parte inferior.</p>
        </Section>

        <Section title="Campañas">
          <p>Una campaña es un período de venta (ej: "Venta de Bandejas julio 2026"). Cada campaña tiene:</p>
          <ul>
            <li><strong>Nombre y slug:</strong> identificador legible y URL-friendly</li>
            <li><strong>Fechas de inicio y fin:</strong> determinan cuándo es visible para los padres</li>
            <li><strong>Estado:</strong> Borrador (no visible), Activa (visible), Finalizada</li>
            <li><strong>Color:</strong> para identificación visual</li>
          </ul>
          <p>Las campañas en estado "Activa" dentro del rango de fechas aparecen en la página pública.</p>
        </Section>

        <Section title="Productos">
          <p>Cada producto pertenece a una campaña. Campos:</p>
          <ul>
            <li><strong>Nombre y descripción:</strong> lo que ven los padres</li>
            <li><strong>Costo:</strong> lo que paga la cooperadora al proveedor (para cálculo de ganancia)</li>
            <li><strong>Precio de venta:</strong> lo que paga el padre/madre</li>
            <li><strong>Orden:</strong> posición de visualización en la página pública</li>
          </ul>
          <p>La ganancia unitaria se calcula automáticamente: Precio - Costo.</p>
        </Section>

        <Section title="Pedidos">
          <p>Cuando un padre realiza un pedido desde la página pública, se genera un código único (ej: PZA-2026-000001). El flujo es:</p>
          <ol>
            <li><strong>Pendiente:</strong> se crea el pedido</li>
            <li><strong>Pendiente Pago:</strong> se sube comprobante de transferencia o se indica pago en efectivo</li>
            <li><strong>Pagado:</strong> el admin verifica el pago</li>
            <li><strong>Entregado:</strong> se registra la entrega</li>
          </ol>
          <p>El admin puede cambiar el estado manualmente desde la vista detallada del pedido.</p>
        </Section>

        <Section title="Pagos">
          <p>Los pagos se registran cuando el padre sube un comprobante (transferencia) o indica pago en efectivo. El admin debe:</p>
          <ol>
            <li>Revisar el comprobante adjunto</li>
            <li><strong>Verificar:</strong> confirma que el pago es correcto → el pedido pasa a "Pagado"</li>
            <li><strong>Rechazar:</strong> si hay un problema → el pedido vuelve a "Pendiente"</li>
          </ol>
        </Section>

        <Section title="Entregas">
          <p>Una vez verificado el pago, se puede registrar la entrega al padre/madre. Seleccioná el pedido pagado y agregá notas si es necesario.</p>
        </Section>

        <Section title="Reportes">
          <p>Cuatro vistas de análisis:</p>
          <ul>
            <li><strong>Dashboard:</strong> métricas generales</li>
            <li><strong>Reporte Financiero:</strong> cobros por efectivo/transferencia, costo proveedor, ganancia y margen por campaña</li>
            <li><strong>Por Campaña / Producto / Sala:</strong> desglose de ventas</li>
          </ul>
          <p>Todos los reportes aceptan filtros de fecha y campaña. Se pueden exportar a Excel y PDF.</p>
        </Section>

        <Section title="Configuración">
          <p> Datos de la institución: nombre, colores, teléfono, WhatsApp, dirección, redes sociales y mensaje de bienvenida. Estos datos se muestran en la página pública.</p>
        </Section>

        <Section title="Usuarios">
          <p>Solo los administradores pueden crear usuarios. Cada usuario tiene un rol:</p>
          <ul>
            <li><strong>ADMIN:</strong> acceso total a todas las funciones</li>
            <li><strong>OPERADOR:</strong> puede gestionar pedidos, pagos, entregas y ver reportes</li>
          </ul>
        </Section>

        <Section title="Auditoría">
          <p>Registro de todas las acciones importantes: logins, cambios de estado, verificación de pagos, etc. Incluye fecha, usuario, acción, detalles e IP.</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="font-heading font-bold text-gray-900 text-lg mb-2">{title}</h2>
      <div className="text-sm text-gray-600 space-y-2 prose prose-sm max-w-none">
        {children}
      </div>
    </div>
  )
}
