import Hero from "@/components/hero"
import MenuCategories from "@/components/menu-categories"
import CustomerHeader from "@/components/customer-header"
import CustomerFooter from "@/components/customer-footer"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />
      <main>
        <Hero />
        <MenuCategories />

        {/* Sección Nosotros */}
        <section className="py-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 items-stretch">
            {/* Columna Izquierda - Información */}
            <div className="bg-[#1000a3] text-white p-5 md:col-span-1 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">Nosotros</h2>
              <p className="whitespace-pre-line text-sm md:text-base leading-relaxed opacity-95">
                Somos sabor marino rápido y bien hecho. En 200 Millas preparamos
                tus platos favoritos con ingredientes frescos y el auténtico
                toque peruano. Queremos que disfrutes una experiencia ágil,
                sabrosa y consistente, en salón o delivery.
              </p>
            </div>

            {/* Columna Derecha - Imagen */}
            <div className="relative md:col-span-2 h-[300px] md:h-[500px] w-full overflow-hidden rounded-md md:rounded-lg">
              <Image
                src="/personacomiendo.png"
                alt="Cliente disfrutando de 200 Millas"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Banner 3 imágenes */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="relative h-[220px] md:h-[500px] w-full overflow-hidden">
              <Image src="/quepique.png" alt="Que pique" fill className="object-cover" />
            </div>
            <div className="relative h-[220px] md:h-[500px] w-full overflow-hidden">
              <Image src="/saboramar.png" alt="Sabor a mar" fill className="object-cover" />
            </div>
            <div className="relative h-[220px] md:h-[500px] w-full overflow-hidden">
              <Image src="/pescadeldia.png" alt="Pescado del día" fill className="object-cover" />
            </div>
          </div>
        </section>
      </main>
      <CustomerFooter />

      {/* Product Options Modal */}
      {selectedItem && (
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedItem(null)
          }}
          onAddToCart={handleAddToCart}
          menuItem={selectedItem}
        />
      )}

      {isModalOpen && (
        <button 
          onClick={() => {
            setIsModalOpen(false)
            setSelectedItem(null)
          }}
          className="fixed top-4 right-4 z-[9999] p-2 text-white opacity-90 transition-opacity hover:opacity-100"
        >
          <X className="h-10 w-10" />
        </button>
      )}
    </div>
  )
}
