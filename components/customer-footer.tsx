"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function CustomerFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">200 Millas</h3>
            <p className="text-gray-400">
              La mejor comida marina peruana, entregada con pasión y frescura directamente a tu mesa.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/carta" className="hover:text-white transition-colors">Carta</Link></li>
              <li><Link href="/locales" className="hover:text-white transition-colors">Locales</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>contacto@200millas.com</li>
              <li>+51 999 999 999</li>
              <li>Av. La Marina 200, San Miguel</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#1000a3] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#1000a3] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#1000a3] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} 200 Millas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

