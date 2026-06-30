import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../api/client'

export default function PaymentPage() {
  const { code } = useParams<{ code: string }>()
  const [searchParams] = useSearchParams()
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [method, setMethod] = useState('transferencia')
  const [voucher, setVoucher] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<Record<string, string | number | null> | null>(null)

  const handleOcr = async (file: File) => {
    setOcrLoading(true)
    setOcrResult(null)
    try {
      const data = await api.ocrVoucher(file)
      setOcrResult(data)
    } catch {
      setOcrResult({ raw_text: 'No se pudo leer el comprobante' })
    } finally {
      setOcrLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const order = await api.getOrder(code, phone)
      const res = await api.createPayment({
        order: order.id,
        phone,
        method,
        voucher: method === 'transferencia' ? voucher || undefined : undefined,
        ocr: ocrResult || undefined,
      })
      void res
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Pago registrado</h1>
        <p className="text-gray-500 mb-6">
          {method === 'efectivo'
            ? 'Se registró tu pago en efectivo. Será verificado por un administrador.'
            : 'Tu comprobante fue enviado correctamente. Será verificado por un administrador.'}
        </p>
        <div className="flex flex-col gap-3">
          <Link to={`/consultar?code=${code}&phone=${encodeURIComponent(phone)}`} className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-2xl transition-colors">
            Consultar pedido
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2 text-center">Registrar pago</h1>
      <p className="text-center text-gray-500 text-sm mb-6">Pedido: <span className="font-mono font-medium">{code}</span></p>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-md p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono</label>
          <input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10}
            required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Ej: 3624617500"
            className="w-full px-4 py-3 rounded-xl border border-gray-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMethod('transferencia')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm border transition-colors ${
                method === 'transferencia'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Transferencia
            </button>
            <button
              type="button"
              onClick={() => setMethod('efectivo')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm border transition-colors ${
                method === 'efectivo'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Efectivo
            </button>
          </div>
        </div>

        {method === 'transferencia' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setVoucher(file)
                setOcrResult(null)
                if (file) void handleOcr(file)
              }}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              required
            />
            <p className="text-xs text-gray-400 mt-1">JPG o PNG — máx. 5 MB</p>
            {ocrLoading && (
              <div className="mt-2 w-full bg-gray-100 text-gray-600 font-medium py-2 rounded-xl text-sm text-center">
                Leyendo comprobante automáticamente...
              </div>
            )}
            {ocrResult && (
              <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm space-y-1">
                {ocrResult.name && <p><span className="text-gray-500">Nombre:</span> <span className="font-medium">{String(ocrResult.name)}</span></p>}
                {ocrResult.dni && <p><span className="text-gray-500">DNI/CUIL:</span> <span className="font-medium">{String(ocrResult.dni)}</span></p>}
                {ocrResult.amount && <p><span className="text-gray-500">Monto:</span> <span className="font-medium">${Number(ocrResult.amount).toLocaleString('es-AR')}</span></p>}
                {ocrResult.date && <p><span className="text-gray-500">Fecha:</span> <span className="font-medium">{String(ocrResult.date)}</span></p>}
                {ocrResult.operation_id && <p><span className="text-gray-500">Operación:</span> <span className="font-medium">{String(ocrResult.operation_id)}</span></p>}
                {!ocrResult.name && !ocrResult.dni && !ocrResult.amount && !ocrResult.date && !ocrResult.operation_id && (
                  <p className="text-gray-400">No se detectaron datos. Verificá que la imagen sea clara.</p>
                )}
                {ocrResult.raw_text && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Ver texto detectado</summary>
                    <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{String(ocrResult.raw_text)}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {method === 'efectivo' && (
          <div className="bg-orange-50 text-orange-700 text-sm px-4 py-3 rounded-xl">
            Al seleccionar efectivo, el pago quedará pendiente de verificación por un administrador.
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <button
          type="submit"
          disabled={loading || (method === 'transferencia' && !voucher)}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Registrar pago'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to={`/consultar?code=${code}&phone=${encodeURIComponent(phone)}`} className="text-sm text-gray-400 hover:text-gray-600">
          &larr; Volver al pedido
        </Link>
      </div>
    </div>
  )
}
