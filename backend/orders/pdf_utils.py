from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

GREEN = HexColor('#22C55E')
DARK = HexColor('#1A1A2E')
GRAY = HexColor('#6B7280')
LIGHT_BG = HexColor('#F0FDF4')
WHITE = HexColor('#FFFFFF')


def generate_order_pdf(order):
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    margin = 20 * mm
    y = h - 20 * mm

    # Header verde
    c.setFillColor(GREEN)
    c.roundRect(10 * mm, y - 15 * mm, w - 20 * mm, 18 * mm, 8, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 16)
    c.drawCentredString(w / 2, y - 9 * mm, 'Cooperadora Online')
    y -= 30 * mm

    # Código del pedido
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(w / 2, y, order.code)
    y -= 8 * mm

    # Estado badge
    status_text = order.get_status_display()
    status_colors = {
        'Pendiente': HexColor('#FEF3C7'),
        'Pendiente de pago': HexColor('#FFEDD5'),
        'Pagado': HexColor('#DBEAFE'),
        'Entregado': HexColor('#DCFCE7'),
        'Cancelado': HexColor('#FEE2E2'),
    }
    badge_bg = status_colors.get(status_text, HexColor('#F3F4F6'))
    text_w = c.stringWidth(status_text, 'Helvetica-Bold', 10)
    badge_x = (w - text_w - 20) / 2
    c.setFillColor(badge_bg)
    c.roundRect(badge_x, y - 3 * mm, text_w + 20, 7 * mm, 3.5, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 10)
    c.drawCentredString(w / 2, y - 1 * mm, status_text)
    y -= 15 * mm

    # Datos del cliente - fondo gris claro
    box_h = 30 * mm
    c.setFillColor(LIGHT_BG)
    c.roundRect(15 * mm, y - box_h, w - 30 * mm, box_h, 8, fill=1, stroke=0)
    inner_x = 22 * mm
    col2_x = w / 2 + 5 * mm
    ty = y - 7 * mm

    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(inner_x, ty, 'Nombre')
    c.drawString(col2_x, ty, 'Telefono')
    ty -= 5 * mm
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(inner_x, ty, order.customer_name or '-')
    c.drawString(col2_x, ty, order.phone or '-')
    ty -= 8 * mm

    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(inner_x, ty, 'Alumno/a')
    c.drawString(col2_x, ty, 'Sala')
    ty -= 5 * mm
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(inner_x, ty, order.student_name or '-')
    c.drawString(col2_x, ty, order.classroom or '-')
    y -= box_h + 8 * mm

    # Productos
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(15 * mm, y, 'Productos')
    y -= 8 * mm

    # Header tabla
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(15 * mm, y, 'Producto')
    c.drawString(w - 55 * mm, y, 'Cant.')
    c.drawString(w - 35 * mm, y, 'Precio')
    c.drawString(w - 20 * mm, y, 'Subtotal')
    y -= 3 * mm
    c.setStrokeColor(HexColor('#E5E7EB'))
    c.line(15 * mm, y, w - 15 * mm, y)
    y -= 5 * mm

    # Items
    c.setFont('Helvetica', 10)
    for item in order.items.all():
        c.setFillColor(DARK)
        name = item.product.name
        if len(name) > 25:
            name = name[:23] + '..'
        c.drawString(15 * mm, y, name)
        c.setFillColor(GRAY)
        c.drawCentredString(w - 52 * mm, y, str(item.quantity))
        c.drawRightString(w - 30 * mm, y, f"${int(item.unit_price):,}")
        c.setFillColor(DARK)
        c.drawRightString(w - 15 * mm, y, f"${int(item.subtotal):,}")
        y -= 7 * mm

    # Línea separadora
    y -= 2 * mm
    c.setStrokeColor(HexColor('#E5E7EB'))
    c.line(15 * mm, y, w - 15 * mm, y)
    y -= 8 * mm

    # Total
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(15 * mm, y, 'Total')
    c.setFillColor(GREEN)
    c.setFont('Helvetica-Bold', 14)
    c.drawRightString(w - 15 * mm, y, f"${int(order.total):,}")
    y -= 12 * mm

    # Observaciones
    if order.notes:
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(15 * mm, y, 'Observaciones:')
        y -= 5 * mm
        c.setFillColor(DARK)
        c.setFont('Helvetica', 10)
        c.drawString(15 * mm, y, order.notes)
        y -= 10 * mm

    # Fecha
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    created = order.created_at.strftime('%d/%m/%Y, %H:%M')
    c.drawString(15 * mm, y, f"Creado: {created}")
    y -= 15 * mm

    # Footer
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawCentredString(w / 2, 18 * mm, 'Desarrollado por ctsoft.com.ar')

    c.save()
    buf.seek(0)
    return buf
