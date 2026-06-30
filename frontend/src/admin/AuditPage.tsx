import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AuditLog } from '../types'

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAuditLogs().then(setLogs).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">Auditoría</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Usuario</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Acción</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Detalles</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('es-AR')}
                    </td>
                    <td className="px-5 py-3 font-medium">{log.username}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{log.action}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{log.details}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{log.ip_address}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No hay logs de auditoría</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
