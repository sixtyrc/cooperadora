import re
import pytesseract
from PIL import Image

TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_voucher_data(image_file):
    """
    Extrae datos de un comprobante bancario argentino.
    Soporta: Mercado Pago, transferencias bancarias, CVU/alias, apps bancarias.
    """
    img = Image.open(image_file)

    # Preprocesamiento: escala de grises
    if img.mode != 'L':
        img = img.convert('L')

    # OCR con español
    text = pytesseract.image_to_string(img, lang='spa+eng')

    result = {
        'raw_text': text.strip(),
        'name': _extract_name(text),
        'dni': _extract_dni(text),
        'amount': _extract_amount(text),
        'date': _extract_date(text),
        'operation_id': _extract_operation_id(text),
        'cbu_cvu': _extract_cbu_cvu(text),
    }
    return result


def _extract_name(text):
    """Extrae nombre del titular del comprobante argentino."""
    patterns = [
        # Mercado Pago / apps modernas
        r'(?:Titular|Nombre|Beneficiario|Destinatario|A nombre de|Cuenta de)[:\s]*(.+)',
        r'(?:Cliente|Persona|Recibe)[:\s]*(.+)',
        # "Juan Perez" después de saltos de línea (formato MP)
        r'(?:env[ií]a|Env[ií]a|De|Desde)[:\s]*\n\s*(.+)',
        # Línea con nombre propio (2+ palabras, capitalizadas)
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            name = m.group(1).strip()
            name = re.sub(r'\s+', ' ', name)
            # Limpiar: quitar caracteres raros al final
            name = re.sub(r'[^\w\sáéíóúñü.]', '', name).strip()
            # Validar que parezca nombre (al menos 2 letras)
            if len(name) >= 3 and re.search(r'[a-záéíóúñü]{2,}', name, re.IGNORECASE):
                return name[:80]
    return None


def _extract_dni(text):
    """Extrae DNI o CUIL del comprobante."""
    patterns = [
        # CUIL/CUIT: XX-XXXXXXXX-X o XX XXXXXXXX X
        r'\b(\d{2}[\s.-]?\d{8}[\s.-]?\d)\b',
        # DNI: 7 u 8 dígitos seguido de "DNI" o "Documento"
        r'(?:DNI|Documento|Doc\.?|D\.N\.I\.?)[:\s]*(\d{7,8})',
        # DNI standalone: 7-8 dígitos entre espacios/puntuación
        r'\b(\d{7,8})\b',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = m.group(1).strip().replace(' ', '').replace('-', '').replace('.', '')
            # Validar largo
            if 8 <= len(val) <= 11:
                return val
    return None


def _extract_amount(text):
    """Extrae el monto de la operación."""
    patterns = [
        r'\$\s*([\d.,]+)',
        r'(?:Monto|Importe|Total|Enviar|Env[ií]o|Cr[eé]dito)[:\s]*\$?\s*([\d.,]+)',
        r'([\d]{1,3}(?:\.\d{3})+,\d{2})',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            amount_str = m.group(1).replace('.', '').replace(',', '.')
            try:
                return float(amount_str)
            except ValueError:
                continue
    return None


def _extract_date(text):
    """Extrae la fecha de la operación."""
    patterns = [
        # 19/06/2026 o 19-06-2026
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        # 19 de junio de 2026
        r'(\d{1,2}\s+de\s+\w+\s+(?:de\s+)?\d{4})',
        # 2026-06-19
        r'(\d{4}[/-]\d{2}[/-]\d{2})',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return None


def _extract_operation_id(text):
    """Extrae número de operación / referencia."""
    patterns = [
        r'(?:N[°º]?[\s:]*(?:de\s+)?(?:operaci[oó]n|transacci[oó]n|referencia|comprobante))[:\s]*(\d+)',
        r'(?:Nro\.?|N[uú]mero)[:\s]*(\d{6,})',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = m.group(1).strip().replace(' ', '').replace('-', '')
            return val
    return None


def _extract_cbu_cvu(text):
    """Extrae CBU o CVU si están presentes."""
    m = re.search(r'\b(\d{22})\b', text)
    if m:
        return m.group(1)
    m = re.search(r'(?:Alias|alias)[:\s]+(\w[\w.]+)', text, re.IGNORECASE)
    if m:
        return m.group(1)
    return None
