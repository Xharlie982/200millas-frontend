"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type { CartItemWithOptions } from "@/lib/cart-context"

interface OptionConfig {
  id: string
  name: string
  type: "radio" | "checkbox" | "number"
  required: boolean
  options: {
    id: string
    name: string
    price: number
  }[]
  defaultSelection?: string
}

interface ProductOptionsModalProps {
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

export default function ProductOptionsModal({
  isOpen,
  onClose,
  onAddToCart,
  menuItem,
}: ProductOptionsModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({})
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [totalPrice, setTotalPrice] = useState(menuItem.price)

  useEffect(() => {
    if (isOpen && menuItem.configuracionOpciones) {
      // Set default selections
      const defaults: Record<string, string> = {}
      menuItem.configuracionOpciones.forEach((option) => {
        if (option.defaultSelection) {
          defaults[option.id] = option.defaultSelection
        }
      })
      setSelectedOptions(defaults)
    } else {
      setSelectedOptions({})
    }
    setQuantity(1)
    setSpecialInstructions("")
    setTotalPrice(menuItem.price)
  }, [isOpen, menuItem])

  useEffect(() => {
    // Calculate total price
    let basePrice = menuItem.price

    if (menuItem.configuracionOpciones) {
      for (const optionConfig of menuItem.configuracionOpciones) {
        const selection = selectedOptions[optionConfig.id]
        if (selection) {
          if (Array.isArray(selection)) {
            // Handle checkboxes (multiple selections)
            for (const selectedId of selection) {
              const option = optionConfig.options.find((opt) => opt.id === selectedId)
              if (option) {
                basePrice += option.price
              }
            }
          } else {
            // Handle radio buttons (single selection)
            const option = optionConfig.options.find((opt) => opt.id === selection)
            if (option) {
              basePrice += option.price
            }
          }
        }
      }
    }

    setTotalPrice(basePrice)
  }, [selectedOptions, menuItem])

  const handleRadioChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const handleCheckboxChange = (optionId: string, valueId: string, checked: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[optionId] as string[] | undefined
      if (checked) {
        return { ...prev, [optionId]: [...(current || []), valueId] }
      } else {
        return { ...prev, [optionId]: (current || []).filter((id) => id !== valueId) }
      }
    })
  }

  const handleAddToCart = () => {
    const cartItem: CartItemWithOptions = {
      id: `cart-${Date.now()}-${Math.random()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: totalPrice,
      image: menuItem.image,
      quantity,
      basePrice: menuItem.price,
      selectedOptions,
      specialInstructions: specialInstructions.trim() || undefined,
    }

    onAddToCart(cartItem)
    onClose()
  }

  const isFormValid = () => {
    if (!menuItem.configuracionOpciones) return true

    for (const option of menuItem.configuracionOpciones) {
      if (option.required && !selectedOptions[option.id]) {
        return false
      }
    }
    return true
  }

  if (!menuItem.configuracionOpciones || menuItem.configuracionOpciones.length === 0) {
    // Simple add to cart without options
    const handleSimpleAddToCart = () => {
      const cartItem: CartItemWithOptions = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        price: totalPrice,
        image: menuItem.image,
        quantity,
        basePrice: menuItem.price,
        selectedOptions: {},
        specialInstructions: specialInstructions.trim() || undefined,
      }

      onAddToCart(cartItem)
      onClose()
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{menuItem.name}</DialogTitle>
            <DialogDescription>{menuItem.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img src={menuItem.image || "/placeholder.svg"} alt={menuItem.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Cantidad</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Instrucciones especiales (opcional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Ej: Sin cebolla, sin ají, etc..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between text-2xl font-bold text-[#1000a3] border-t pt-4">
                <span>Total</span>
                <span>S/. {(totalPrice * quantity).toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleSimpleAddToCart}
              className="w-full bg-[#e2e200] text-[#1000a3] hover:bg-[#e2e200]/90 font-bold text-lg py-6"
            >
              Agregar {quantity} al carrito - S/. {(totalPrice * quantity).toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menuItem.name}</DialogTitle>
          <DialogDescription>{menuItem.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img src={menuItem.image || "/placeholder.svg"} alt={menuItem.name} className="w-full h-full object-cover" />
          </div>

          {/* Options */}
          <div className="space-y-6">
            {menuItem.configuracionOpciones.map((optionConfig) => (
              <div key={optionConfig.id}>
                <Label className="text-lg font-semibold">
                  {optionConfig.name}
                  {optionConfig.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {optionConfig.type === "radio" && (
                  <RadioGroup
                    value={selectedOptions[optionConfig.id] as string}
                    onValueChange={(value) => handleRadioChange(optionConfig.id, value)}
                    className="mt-3 space-y-2"
                  >
                    {optionConfig.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`${optionConfig.id}-${option.id}`} />
                        <Label
                          htmlFor={`${optionConfig.id}-${option.id}`}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <span>{option.name}</span>
                          {option.price !== 0 && (
                            <span className="text-[#1000a3] font-semibold ml-2">+S/. {option.price.toFixed(2)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {optionConfig.type === "checkbox" && (
                  <div className="mt-3 space-y-2">
                    {optionConfig.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${optionConfig.id}-${option.id}`}
                          checked={(selectedOptions[optionConfig.id] as string[] || []).includes(option.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(optionConfig.id, option.id, checked as boolean)}
                        />
                        <Label
                          htmlFor={`${optionConfig.id}-${option.id}`}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <span>{option.name}</span>
                          {option.price !== 0 && (
                            <span className="text-[#1000a3] font-semibold ml-2">+S/. {option.price.toFixed(2)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Special Instructions */}
            <div>
              <Label htmlFor="instructions">Instrucciones especiales (opcional)</Label>
              <Textarea
                id="instructions"
                placeholder="Ej: Sin cebolla, sin ají, etc..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Cantidad</Label>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </Button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between text-2xl font-bold text-[#1000a3] border-t pt-4">
              <span>Total</span>
              <span>S/. {(totalPrice * quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!isFormValid()}
            className="w-full bg-[#e2e200] text-[#1000a3] hover:bg-[#e2e200]/90 font-bold text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar {quantity} al carrito - S/. {(totalPrice * quantity).toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

