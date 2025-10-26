"use client"

import Link from "next/link"

const categories = [
  {
    id: 1,
    name: "Promos Fast",
    image: "/promos-fast-neon.jpg",
    color: "bg-blue-900",
  },
  {
    id: 2,
    name: "Express",
    image: "/express-comida-marina.jpg",
    color: "bg-purple-600",
  },
  {
    id: 3,
    name: "Promociones",
    image: "/promociones-comida.jpg",
    color: "bg-blue-600",
  },
  {
    id: 4,
    name: "Sopas Power",
    image: "/sopa-marina-ceviche.jpg",
    color: "bg-purple-500",
  },
  {
    id: 5,
    name: "Bowls Del Tigre",
    image: "/bowl-del-tigre.jpg",
    color: "bg-blue-400",
  },
  {
    id: 6,
    name: "Leche de Tigre",
    image: "/leche-de-tigre-postres.jpg",
    color: "bg-purple-400",
  },
  {
    id: 7,
    name: "Ceviches",
    image: "/ceviche-peruano.jpg",
    color: "bg-blue-500",
  },
  {
    id: 8,
    name: "Fritazo",
    image: "/fritazo-comida-marina.jpg",
    color: "bg-purple-600",
  },
  {
    id: 9,
    name: "Mostrimar",
    image: "/mariscos-mostrimar.jpg",
    color: "bg-blue-600",
  },
]

export default function MenuCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">Nuestra carta</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/productos?categoria=${category.name}`}>
              <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div
                  className={`absolute inset-0 ${category.color} opacity-40 group-hover:opacity-30 transition`}
                ></div>
                <div className="absolute inset-0 flex items-end justify-between p-4">
                  <h3 className="text-white font-bold text-xl">{category.name}</h3>
                  <button className="bg-yellow-400 text-blue-900 px-4 py-2 rounded font-bold text-sm hover:bg-yellow-300 transition">
                    Ordena ahora
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
