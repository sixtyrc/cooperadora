import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Institution } from '../types'

export default function SettingsPage() {
  const [, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', primary_color: '#22C55E', secondary_color: '#16A34A',
    phone: '', whatsapp: '', address: '', welcome_message: '',
    social_links: '{}' as string
  })

  useEffect(() => {
    api.getInstitution().then(inst => {
      setInstitution(inst)
      setForm({
        name: inst.name,
        primary_color: inst.primary_color,
        secondary_color: inst.secondary_color,
        phone: inst.phone,
        whatsapp: inst.whatsapp,
        address: inst.address,
        welcome_message: inst.welcome_message,
        social_links: JSON.stringify(inst.social_links, null, 2)
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      let socialLinks: Record<string, string> = {}
      try {
        socialLinks = JSON.parse(form.social_links)
      } catch {
        setError('Redes sociales: JSON inválido')
        setSaving(false)
        return
      }
      const payload = { ...form, social_links: socialLinks }
      const updated = await api.updateInstitution(payload as unknown as Partial<Institution>)
      setInstitution(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Institución</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Primario</label>
                <input type="color" value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Secundario</label>
                <input type="color" value={form.secondary_color} onChange={e => setForm({...form, secondary_color: e.target.value})} className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Bienvenida</label>
              <textarea value={form.welcome_message} onChange={e => setForm({...form, welcome_message: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redes Sociales (JSON)</label>
              <textarea value={form.social_links} onChange={e => setForm({...form, social_links: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none font-mono text-sm" rows={4} placeholder='{"instagram": "...", "facebook": "..."}' />
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">Guardado correctamente</div>}

            <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
