"use client"
import type { MenuItem } from "@/lib/types"

interface CartItem extends MenuItem {
  quantity: number
}

interface CartSidebarProps {
  items: CartItem[]
  onRemove: (itemId: string) => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onCheckout: () => void
  isLoading?: boolean
}

export default function CartSidebar({ items, onRemove, onQuantityChange, onCheckout, isLoading }: CartSidebarProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-20 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Carrito</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Tu carrito está vacío</p>
      ) : (
        <>
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-b pb-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">S/. {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                    className="w-6 h-6 bg-gray-300 rounded text-xs font-bold hover:bg-gray-400"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-300 rounded text-xs font-bold hover:bg-gray-400"
                  >
                    +
                  </button>
                  <button onClick={() => onRemove(item.id)} className="text-red-500 text-xs hover:text-red-700 ml-2">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>S/. {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Delivery:</span>
              <span>S/. 5.00</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-2xl font-bold text-blue-900">S/. {(total + 5).toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {isLoading ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
