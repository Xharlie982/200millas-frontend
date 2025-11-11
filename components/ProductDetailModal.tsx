"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Image from "next/image"
import { Minus, Plus, InfoIcon, XIcon, BellIcon } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CartItemWithOptions, SelectedOptionsByGroup } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import type { OptionConfig } from "@/lib/types"

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: CartItemWithOptions) => void
  menuItem: {
    id: string
    name: string
    description: string
    price: number
    image: string
    configuracionOpciones?: OptionConfig[]
  }
}

type SelectedOptions = Record<string, Record<string, number>>


export function ProductDetailModal({ isOpen, onClose, menuItem, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [imageLoading, setImageLoading] = useState(true)
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>()
  // Control open sections to allow auto-closing when a group is completed
  const [openItems, setOpenItems] = useState<string[]>([])
  const [maxWarning, setMaxWarning] = useState<string | null>(null)
  const [isMultiplierBannerVisible, setIsMultiplierBannerVisible] = useState(true)
  const toastRef = useRef<HTMLDivElement | null>(null)

  const optionGroups = useMemo(() => menuItem.configuracionOpciones || [], [menuItem.configuracionOpciones])

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setSelectedOptions({})
      setImageLoading(true)
      setActiveAccordionItem(undefined)
      // open all sections on open
      setOpenItems((menuItem.configuracionOpciones || []).map(g => g.id))
      setMaxWarning(null)
      setIsMultiplierBannerVisible(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (maxWarning) {
      const timer = setTimeout(() => {
        setMaxWarning(null)
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [maxWarning]);

  useEffect(() => {
    if (quantity > 1) {
      setIsMultiplierBannerVisible(true)
    }
  }, [quantity])

  const totalPrice = useMemo(() => {
    let optionsPrice = 0
    for (const groupId in selectedOptions) {
      const group = optionGroups.find((g) => g.id === groupId)
      if (group) {
        for (const optionId in selectedOptions[groupId]) {
          const option = group.options.find((o) => o.id === optionId)
          if (option) {
            optionsPrice += option.price * selectedOptions[groupId][optionId]
          }
        }
      }
    }
    return (menuItem.price + optionsPrice) * quantity
  }, [selectedOptions, quantity, menuItem.price, optionGroups])
  
  const getGroupSelectedCount = (groupId: string) => {
    const group = optionGroups.find(g => g.id === groupId)
    if (!group) return 0
    if (group.type === 'radio') return selectedOptions[groupId] ? 1 : 0
    const opts = selectedOptions[groupId] || {}
    return Object.values(opts).reduce((a, b) => a + b, 0)
  }

  const handleOptionClick = (groupId: string, optionId: string) => {
    const group = optionGroups.find(g => g.id === groupId)
    if (!group) return

    setSelectedOptions((prev) => {
      const newOptions = { ...prev }

      if (group.type === 'radio') {
        // Allow deselecting radio options
        if (newOptions[groupId]?.[optionId]) {
          delete newOptions[groupId]
        } else {
          newOptions[groupId] = { [optionId]: 1 }
        }
        return newOptions
      }
      
      const newGroupOptions = { ...(newOptions[groupId] || {}) }
      const currentSelections = Object.keys(newGroupOptions).length
      const maxSelections = group.maxSelections ?? Infinity

      if (newGroupOptions[optionId]) {
        delete newGroupOptions[optionId]
      } else {
        if (currentSelections >= maxSelections) {
          setMaxWarning(`Máximo ${maxSelections} productos`)
          return prev
        }
        newGroupOptions[optionId] = 1
      }
      
      newOptions[groupId] = newGroupOptions
      // If after toggle we reach the max (considering quantities), auto-close this section
      const sum = Object.values(newGroupOptions).reduce((a: number, b: number) => a + (b as number), 0)
      if (sum >= maxSelections) {
        setOpenItems((items) => items.filter((id) => id !== groupId))
      }
      return newOptions
    });
  };

  const incrementOption = (groupId: string, optionId: string) => {
    const group = optionGroups.find(g => g.id === groupId)
    if (!group || group.type === 'radio') return
    setSelectedOptions((prev) => {
      const newOptions = { ...prev }
      const groupOptions = { ...(newOptions[groupId] || {}) }
      const maxSelections = group.maxSelections ?? Infinity
      const totalSelected = Object.values(groupOptions).reduce((a, b) => a + b, 0)
      if (totalSelected >= maxSelections) { setMaxWarning(`Máximo ${maxSelections} productos`); return prev }
      groupOptions[optionId] = (groupOptions[optionId] || 0) + 1
      newOptions[groupId] = groupOptions
      const newTotal = Object.values(groupOptions).reduce((a, b) => a + b, 0)
      if (newTotal >= maxSelections) {
        setOpenItems((items) => items.filter((id) => id !== groupId))
      }
      return newOptions
    })
  }

  const decrementOption = (groupId: string, optionId: string) => {
    const group = optionGroups.find(g => g.id === groupId)
    if (!group || group.type === 'radio') return
    setSelectedOptions((prev) => {
      const newOptions = { ...prev }
      const groupOptions = { ...(newOptions[groupId] || {}) }
      const current = groupOptions[optionId] || 0
      if (current <= 1) {
        delete groupOptions[optionId]
      } else {
        groupOptions[optionId] = current - 1
      }
      newOptions[groupId] = groupOptions
      return newOptions
    })
  }

  const handleAddToCartClick = () => {
    for (const group of optionGroups) {
      if (group.required) {
        const selections = selectedOptions[group.id] ? Object.keys(selectedOptions[group.id]).length : 0;
        const min = group.maxSelections || 1;
        if (selections < min) {
          alert(`Por favor, selecciona ${min} opción(es) para "${group.name}"`);
          return;
        }
      }
    }

    const finalSelectedOptions: SelectedOptionsByGroup = {}

    for (const groupId in selectedOptions) {
      const group = optionGroups.find(g => g.id === groupId);
      if (group) {
        finalSelectedOptions[groupId] = [];
        for (const optionId in selectedOptions[groupId]) {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            finalSelectedOptions[groupId].push({
              optionId: option.id,
              name: option.name,
              price: option.price,
              quantity: selectedOptions[groupId][optionId]
            });
          }
        }
      }
    }

    const cartItem: CartItemWithOptions = {
      id: `${menuItem.id}-${JSON.stringify(selectedOptions)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: totalPrice / quantity,
      image: menuItem.image,
      quantity,
      basePrice: menuItem.price,
      selectedOptions: finalSelectedOptions,
    }
    onAddToCart(cartItem)
    onClose()
  }

  if (!menuItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogOverlay className="bg-black/80" />
      {maxWarning && (
        <div
          key={maxWarning}
          ref={toastRef}
          className="fixed top-11 right-3 z-[2147483600] bg-[#318EF0] text-white px-3 py-3 rounded-xl shadow-2xl flex items-center gap-2 min-h-[56px] pointer-events-auto"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <InfoIcon className="h-6 w-6" />
          <span className="flex-grow text-center font-bold text-base whitespace-nowrap leading-tight">{maxWarning}</span>
          <button
            type="button"
            className="text-white/80 hover-text-white cursor-pointer"
            onPointerDownCapture={(e) => e.stopPropagation()}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setMaxWarning(null)
            }}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      )}
      <DialogContent
        showCloseButton={false}
        aria-describedby="product-modal-description"
        className="w-[85vw] max-w-none h-[85vh] bg-[#FDFDFD] rounded-2xl p-0 border-none"
        onPointerDownOutside={(e) => {
          const target = e.target as Node
          if (toastRef.current && toastRef.current.contains(target)) {
            e.preventDefault()
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as Node
          if (toastRef.current && toastRef.current.contains(target)) {
            e.preventDefault()
          }
        }}
      >
        <DialogClose asChild>
          <button
            className="absolute -top-2 -right-20 z-50 flex h-12 w-12 items-center justify-center rounded-lg text-white opacity-90 transition-opacity hover:opacity-100 cursor-pointer"
            aria-label="Cerrar modal"
            style={{ cursor: 'pointer' }}
          >
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </DialogClose>
        <div className="relative flex h-full min-h-0">
            {/* --- Columna Izquierda: Imagen (Estática) --- */}
            <div className="relative w-[600px] shrink-0 h-full">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-l-2xl" />}
              <Image
                src={menuItem.image}
                alt={menuItem.name}
                fill
                className={`rounded-l-2xl object-cover transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 50vw, 600px"
              />
            </div>

            {/* --- Columna Derecha: Detalles (con Scroll interno) --- */}
            <div className="flex-1 min-h-0 grid grid-rows-[auto_1fr_auto] h-full overflow-hidden">
              {/* Fila 1: Título y Precio (Altura automática) */}
              <div className="p-5 pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-4">
                    <DialogTitle asChild>
                      <h2 className="text-4xl font-black tracking-tight text-[#212121] font-secondary">{menuItem.name}</h2>
                    </DialogTitle>
                    <DialogDescription asChild>
                      <p id="product-modal-description" className="text-sm text-gray-500 mt-1">{menuItem.description}</p>
                    </DialogDescription>
                  </div>
                  <p className="text-xl font-bold text-[#1000a3] font-primaryTitle">
                    {formatCurrency(menuItem.price)}
                  </p>
                </div>
              </div>

              {/* Fila 2: Opciones (Scrollable) */}
              <div className="min-h-0 overflow-y-auto px-5 pr-3 space-y-4">
                <Accordion type="multiple" className="w-full" value={openItems} onValueChange={(v:any)=>setOpenItems(v)}>
                  {optionGroups.map((group, index) => {
                    const selectedCount = getGroupSelectedCount(group.id)
                    const maxSel = group.maxSelections || 1
                    const isCompleted = group.required && selectedCount >= maxSel
                    
                    const selectedOptionNames = group.required && isCompleted 
                      ? group.options
                        .filter(opt => selectedOptions[group.id]?.[opt.id])
                        .map(opt => `${opt.name} (x${selectedOptions[group.id]?.[opt.id] || 1})`)
                        .join(', ')
                      : null

                    const isAjiLikeGrid = group.type === 'radio' && group.options.length <= 2

                    return (
                    <AccordionItem key={group.id} value={group.id} className={`${index>0 ? 'border-t' : ''}`}>
                      <AccordionTrigger className="font-semibold text-[15px] md:text-[16px] hover:no-underline py-3">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex flex-col items-start text-left">
                            <span>{group.name}</span>
                            {selectedOptionNames && (
                              <p className="text-xs text-gray-500 font-normal mt-1 truncate max-w-xs">
                                {selectedOptionNames}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {group.required && (
                              <span className={`text-[11px] md:text-xs font-semibold px-2 py-0.5 rounded-md border ${isCompleted ? 'bg-green-100 text-green-800 border-green-200' : 'bg-[#FFEBEB] text-[#D40E0E] border-[#F8C1C1]'}`}>
                                {isCompleted ? 'Completado' : 'Requerido'} ({maxSel})
                              </span>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-2">
                        {group.type === 'radio' ? (
                          <ul className={`grid gap-3 ${isAjiLikeGrid ? 'aji-grid' : 'grid-cols-3'}`}>
                            {group.options.map((option) => {
                              const isSelected = !!selectedOptions[group.id]?.[option.id]
                              return (
                                <li
                                  key={option.id}
                                  className={`rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-[#1000a3] bg-[#9F99DA]' : 'border-transparent bg-white hover:border-gray-300'}`}
                                  onClick={() => handleOptionClick(group.id, option.id)}
                                >
                                  <div className="relative w-full aspect-[3/4]">
                                    {option.image && (
                                      <Image src={option.image} alt={option.name} fill className="object-cover" />
                                    )}
                                  </div>
                                  <div className="px-2 py-2 text-center">
                                    <p className={`font-semibold text-xs ${isSelected ? 'text-white' : 'text-gray-800'}`}>{option.name}</p>
                                  </div>
                                </li>
                              )})}
                          </ul>
                        ) : (
                          <ul className="space-y-3">
                            {group.options.map((option) => {
                              const isSelected = !!selectedOptions[group.id]?.[option.id]
                              const isFree = option.price === 0
                              const qty = selectedOptions[group.id]?.[option.id] || 0
                              return (
                                <li
                                  key={option.id}
                                  className={`rounded-xl p-3 pr-3 flex justify-between items-center cursor-pointer border ${isSelected ? 'bg-[#9F99DA] border-indigo-300' : 'bg-white border-gray-200'} transition-colors`}
                                  onClick={() => handleOptionClick(group.id, option.id)}
                                >
                                  <div className="flex items-center gap-4">
                                    {option.image && (
                                      <Image
                                        src={option.image}
                                        alt={option.name}
                                        width={96}
                                        height={96}
                                        className="rounded-md object-cover"
                                      />
                                    )}
                                    <div className="flex flex-col">
                                      <p className="font-semibold text-sm md:text-base">{option.name}</p>
                                      {!isFree && (
                                        <p className="text-xs md:text-sm text-gray-600">+ {formatCurrency(option.price)}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    {isSelected && (
                                      <button
                                        type="button"
                                        className="h-10 w-10 rounded-full flex items-center justify-center text-white bg-[#1000a3] cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          decrementOption(group.id, option.id)
                                        }}
                                      >
                                        <Minus className="h-6 w-6" />
                                      </button>
                                    )}
                                    {isSelected && (
                                      <span className="min-w-[16px] text-center font-semibold">{qty}</span>
                                    )}
                                    {(!isFree || isSelected) && (
                                      <button
                                        type="button"
                                        className="h-10 w-10 rounded-full flex items-center justify-center text-white bg-[#1000a3] cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          incrementOption(group.id, option.id)
                                        }}
                                      >
                                        <Plus className="h-6 w-6" />
                                      </button>
                                    )}
                                  </div>
                                </li>
                              )})}
                          </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )})}
                </Accordion>
              </div>

              <div className="relative p-5 border-t border-gray-200 bg-white rounded-br-2xl">
                {/* Yellow info when quantity > 1, positioned over the footer */}
                {quantity > 1 && isMultiplierBannerVisible && (
                  <div className="absolute bottom-full left-0 right-0 z-10 bg-[#FAB515] text-black font-semibold px-6 py-2.5 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <BellIcon className="h-6 w-6" />
                      <span>Se multiplicará por {quantity} todas las opciones que elija, incluyendo adicionales.</span>
                    </div>
                    <button onClick={() => setIsMultiplierBannerVisible(false)} className="cursor-pointer">
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-medium text-gray-700 whitespace-nowrap">
                      Precio base: {formatCurrency(menuItem.price)}
                    </span>
                    {totalPrice - menuItem.price * quantity > 0 && (
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        Extras: {formatCurrency((totalPrice - menuItem.price * quantity))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-bold w-10 text-center">{quantity}</span>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer" onClick={() => setQuantity((q) => q + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="bg-[#1000a3] text-white font-bold text-lg h-12 flex-grow cursor-pointer rounded-full"
                      onClick={handleAddToCartClick}
                    >
                      Agregar ({formatCurrency(totalPrice)})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}