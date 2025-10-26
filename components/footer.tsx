import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">200 MILLAS</h3>
            <p className="text-white/80">
              La mejor comida marina rápida del Perú. Ceviches frescos y deliciosos preparados con los mejores
              ingredientes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <a href="#menu" className="hover:text-white transition">
                  Menú
                </a>
              </li>
              <li>
                <a href="#promos" className="hover:text-white transition">
                  Promociones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contacto</h4>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>+51 (1) 2345-6789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>info@200millas.pe</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <p className="text-center text-white/60">© 2025 200 Millas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
