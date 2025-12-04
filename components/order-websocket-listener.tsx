"use client"
import { useEffect } from "react"
import { useWebSocketContext } from "@/lib/websocket-context"

interface OrderWebSocketListenerProps {
  orderId: string
  onStatusUpdate?: (status: string) => void
  onMessage?: (message: any) => void
}

/**
 * Componente que escucha actualizaciones de WebSocket para un pedido específico
 * 
 * @example
 * ```tsx
 * <OrderWebSocketListener 
 *   orderId="abc-123"
 *   onStatusUpdate={(status) => console.log('Nuevo estado:', status)}
 * />
 * ```
 */
export function OrderWebSocketListener({ 
  orderId, 
  onStatusUpdate,
  onMessage 
}: OrderWebSocketListenerProps) {
  const { isConnected, subscribeToOrder, unsubscribeFromOrder, lastMessage } = useWebSocketContext()

  useEffect(() => {
    if (isConnected && orderId) {
      // Suscribirse a actualizaciones del pedido
      subscribeToOrder(orderId)
      
      return () => {
        // Desuscribirse al desmontar
        unsubscribeFromOrder(orderId)
      }
    }
  }, [isConnected, orderId, subscribeToOrder, unsubscribeFromOrder])

  useEffect(() => {
    if (lastMessage && lastMessage.order_id === orderId) {
      // Notificar cambio de estado
      if (lastMessage.status && onStatusUpdate) {
        onStatusUpdate(lastMessage.status)
      }
      
      // Notificar mensaje genérico
      if (onMessage) {
        onMessage(lastMessage)
      }
    }
  }, [lastMessage, orderId, onStatusUpdate, onMessage])

  return null // Este componente no renderiza nada
}

