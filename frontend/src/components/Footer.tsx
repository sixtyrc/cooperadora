export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>
          Cooperadora Online &copy; {new Date().getFullYear()} — Desarrollado por{' '}
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
