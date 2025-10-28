"use client"

import Image from "next/image"
import type { MenuItem } from "@/lib/types"

interface ProductCardProps {
  item: MenuItem
  onClick: (item: MenuItem) => void
}

export default function ProductCard({ item, onClick }: ProductCardProps) {
  const showCustomize = item.configuracionOpciones && item.configuracionOpciones.length > 0

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="w-full text-left rounded-lg bg-[#FCF7F1] hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer"
    >
      <div className="flex items-stretch gap-4 p-4">
        {/* Left: Image */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-md">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 112px, 128px"
            priority={false}
          />
        </div>

        {/* Right: Content */}
        <div className="flex-1 flex flex-col justify-between text-[#000000]">
          <div>
            <h4 className="font-display font-bold text-base md:text-lg leading-snug line-clamp-2">{item.name}</h4>
            <p className="mt-1 text-sm md:text-[15px] leading-snug opacity-80 line-clamp-3">{item.description}</p>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <span className="font-bold text-lg md:text-xl">S/ {item.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}


