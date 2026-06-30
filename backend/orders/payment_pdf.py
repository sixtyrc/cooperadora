from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

GREEN = HexColor('#22C55E')
DARK = HexColor('#1A1A2E')
GRAY = HexColor('#6B7280')
LIGHT_BG = HexColor('#F0FDF4')
WHITE = HexColor('#FFFFFF')
ORANGE = HexColor('#F97316')


def generate_payment_pdf(order, payment):
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    y = h - 20 * mm

    # Header verde
    c.setFillColor(GREEN)
    c.roundRect(10 * mm, y - 15 * mm, w - 20 * mm, 18 * mm, 8, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 16)
    c.drawCentredString(w / 2, y - 9 * mm, 'Cooperadora Online')
    y -= 30 * mm

    # Titulo
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(w / 2, y, 'Comprobante de Pago')
    y -= 15 * mm

    # Datos del comprobante
    box_h = 35 * mm
    c.setFillColor(LIGHT_BG)
    c.roundRect(15 * mm, y - box_h, w - 30 * mm, box_h, 8, fill=1, stroke=0)
    inner_x = 22 * mm
    col2_x = w / 2 + 5 * mm
    ty = y - 7 * mm

    # Pedido
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(inner_x, ty, 'Pedido')
    c.drawString(col2_x, ty, 'Metodo de Pago')
    ty -= 5 * mm
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(inner_x, ty, order.code)
    method = payment.get_method_display()
    c.drawString(col2_x, ty, method)
    ty -= 10 * mm

    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(inner_x, ty, 'Cliente')
    c.drawString(col2_x, ty, 'Estado')
    ty -= 5 * mm
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(inner_x, ty, order.customer_name)
    # Estado badge
    status = payment.get_status_display()
    c.setFillColor(ORANGE if payment.status == 'pendiente' else GREEN)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(col2_x, ty, status)
    y -= box_h + 8 * mm

    # Total del pedido
    c.setFillColor(LIGHT_BG)
    c.roundRect(15 * mm, y - 12 * mm, w - 30 * mm, 12 * mm, 6, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(22 * mm, y - 8 * mm, 'Total del pedido:')
    c.setFillColor(GREEN)
    c.setFont('Helvetica-Bold', 13)
    c.drawRightString(w - 22 * mm, y - 8 * mm, f"${int(order.total):,}")
    y -= 22 * mm

    # Fecha
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 9)
    created = payment.created_at.strftime('%d/%m/%Y, %H:%M:%S')
    c.drawCentredString(w / 2, y, f"Registrado: {created}")
    y -= 15 * mm

    # Mensaje
    c.setFillColor(DARK)
    c.setFont('Helvetica', 10)
    if payment.status == 'pendiente':
        msg = 'Tu pago esta siendo verificado por un administrador.'
    else:
        msg = f'Estado del pago: {status}'
    c.drawCentredString(w / 2, y, msg)
    y -= 20 * mm

    # Footer
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawCentredString(w / 2, 18 * mm, 'Desarrollado por ctsoft.com.ar')

    c.save()
    buf.seek(0)
    return buf
