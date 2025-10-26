export default function Hero() {
  return (
    <section className="relative h-96 bg-gradient-to-r from-blue-900 to-blue-800 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src="/ceviche-peruano-comida-marina.jpg" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 text-center px-4">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">SOMOS CEVICHE</h2>
        <p className="text-xl text-white/90 mb-6">La mejor comida marina rápida del Perú</p>
        <button className="bg-yellow-400 text-blue-900 px-8 py-3 rounded font-bold text-lg hover:bg-yellow-300 transition">
          PIDE AQUÍ
        </button>
      </div>
    </section>
  )
}
