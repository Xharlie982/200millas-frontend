"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useWebSocket, type WebSocketMessage } from "@/hooks/use-websocket"
import { useAuth } from "./auth-context"
import { toast } from "sonner"

interface WebSocketContextType {
  isConnected: boolean
  subscribeToOrder: (orderId: string) => boolean
  unsubscribeFromOrder: (orderId: string) => boolean
  lastMessage: WebSocketMessage | null
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const handleMessage = (message: WebSocketMessage) => {
    setLastMessage(message)
    
    // Mostrar notificación según el tipo de mensaje
    if (message.title && message.message) {
      toast.info(message.title, {
        description: message.message,
        duration: 5000,
      })
    } else if (message.message) {
      toast.info(message.message)
    }

    // Emitir evento personalizado para que otros componentes puedan escuchar
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("websocket-message", {
          detail: message,
        })
      )
    }
  }

  const { isConnected, subscribeToOrder, unsubscribeFromOrder } = useWebSocket({
    onMessage: handleMessage,
    onError: (error) => {
      // Solo loguear errores, no mostrar toast si no está autenticado o no hay token
      if (isAuthenticated && token) {
        console.warn("WebSocket error (user is authenticated, this is expected if backend is not available):", error)
        // No mostrar toast para evitar spam de errores cuando el backend no está disponible
      } else {
        console.log("WebSocket error (user not authenticated, skipping):", error)
      }
    },
    onConnect: () => {
      console.log("WebSocket connected successfully")
    },
    onDisconnect: () => {
      console.log("WebSocket disconnected")
    },
    autoConnect: isAuthenticated && !!token,
    token,
  })

  // Suscribirse automáticamente a actualizaciones cuando el usuario está autenticado
  useEffect(() => {
    if (isConnected && user) {
      // Aquí puedes suscribirte a pedidos específicos si es necesario
      // Por ejemplo, si el usuario tiene un pedido activo
    }
  }, [isConnected, user])

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribeToOrder,
        unsubscribeFromOrder,
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}

