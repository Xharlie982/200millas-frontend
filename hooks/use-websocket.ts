"use client"
import { useEffect, useRef, useState, useCallback } from "react"

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://hxr842r7zb.execute-api.us-east-1.amazonaws.com/dev"

export interface WebSocketMessage {
  type: string
  order_id?: string
  message?: string
  title?: string
  status?: string
  [key: string]: any
}

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Event) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoConnect?: boolean
  token?: string | null
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    autoConnect = true,
    token,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    try {
      // Construir URL con token si está disponible
      const url = token ? `${WEBSOCKET_URL}?token=${token}` : WEBSOCKET_URL
      
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        reconnectAttempts.current = 0
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log("WebSocket message received:", message)
          onMessage?.(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onerror = (error) => {
        // Solo loguear como warning, no como error, ya que es esperado si el backend no está disponible
        console.warn("WebSocket connection error (this is expected if backend is not available):", error)
        onError?.(error)
      }

      ws.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason)
        setIsConnected(false)
        setConnectionId(null)
        onDisconnect?.()

        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
    }
  }, [token, onMessage, onError, onConnect, onDisconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect")
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionId(null)
  }, [])

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    console.warn("WebSocket is not connected")
    return false
  }, [])

  const subscribeToOrder = useCallback((orderId: string) => {
    return send({
      action: "subscribe_order",
      order_id: orderId,
    })
  }, [send])

  const unsubscribeFromOrder = useCallback((orderId: string) => {
    return send({
      action: "unsubscribe_order",
      order_id: orderId,
    })
  }, [send])

  const getSubscriptions = useCallback(() => {
    return send({
      action: "get_subscriptions",
    })
  }, [send])

  useEffect(() => {
    if (autoConnect && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, token, connect, disconnect])

  return {
    isConnected,
    connectionId,
    connect,
    disconnect,
    send,
    subscribeToOrder,
    unsubscribeFromOrder,
    getSubscriptions,
  }
}

