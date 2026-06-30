import { useInstitution } from '../context/useInstitution'

export default function Footer() {
  const { institution } = useInstitution()
  const links = Object.entries(institution?.social_links || {})
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p className="text-gray-600 font-medium">{institution?.name || 'Cooperadora Online'}</p>
        {(institution?.address || institution?.phone || institution?.whatsapp) && (
          <p className="mt-2">
            {[institution.address, institution.phone, institution.whatsapp && `WhatsApp: ${institution.whatsapp}`].filter(Boolean).join(' · ')}
          </p>
        )}
        {links.length > 0 && <div className="mt-2 flex justify-center gap-4">
          {links.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{name}</a>)}
        </div>}
        <p className="mt-3">
          &copy; {new Date().getFullYear()} — Desarrollado por{' '}
          <a
            href="https://ctsoft.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            CTSoft
          </a>
        </p>
      </div>
    </footer>
  )
}
