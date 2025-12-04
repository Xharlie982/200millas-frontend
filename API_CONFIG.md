# Configuración de API - Frontend

## URL Base de la API

La URL base de la API está configurada en `lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://glsnif507b.execute-api.us-east-1.amazonaws.com/dev"
```

## WebSocket

La URL del WebSocket está configurada en `hooks/use-websocket.ts`:

```typescript
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://itsla0jmr8.execute-api.us-east-1.amazonaws.com/dev"
```

## Variables de Entorno

Para cambiar las URLs, crea un archivo `.env.local` en la raíz del proyecto frontend:

```env
NEXT_PUBLIC_API_URL=https://glsnif507b.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_WEBSOCKET_URL=wss://itsla0jmr8.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_TENANT_ID=200millas
```

## Endpoints Disponibles

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil
- `PATCH /auth/profile` - Actualizar perfil
- `PATCH /auth/password` - Cambiar contraseña

### Pedidos
- `POST /orders` - Crear pedido
- `GET /orders` - Listar pedidos
- `GET /orders/{order_id}` - Obtener detalle de pedido
- `GET /orders/current` - Obtener pedido activo
- `GET /orders/{order_id}/status` - Obtener estado detallado
- `PATCH /orders/{order_id}/status` - Actualizar estado

### Menú
- `GET /menu/categories` - Obtener categorías
- `GET /menu/items` - Obtener productos

### Dashboard
- `GET /dashboard` - Resumen del dashboard
- `GET /dashboard/timeline/{order_id}` - Timeline de pedido
- `GET /dashboard/staff-performance` - Rendimiento del staff

## Formato de Respuesta

El backend devuelve respuestas en el formato:

```json
{
  "success": true,
  "data": { ... }
}
```

El cliente API (`lib/api.ts`) extrae automáticamente el campo `data` de las respuestas.

## Autenticación

Todos los endpoints (excepto `/menu/*` y `/auth/register`, `/auth/login`) requieren autenticación JWT.

El token se almacena en `localStorage` con la clave `token` y se envía automáticamente en el header:

```
Authorization: Bearer <token>
```

## WebSocket - Notificaciones en Tiempo Real

El frontend incluye soporte para WebSocket para recibir notificaciones en tiempo real sobre cambios en los pedidos.

### Uso del Hook

```typescript
import { useWebSocketContext } from '@/lib/websocket-context'

function MyComponent() {
  const { isConnected, subscribeToOrder, unsubscribeFromOrder, lastMessage } = useWebSocketContext()
  
  useEffect(() => {
    if (isConnected) {
      // Suscribirse a actualizaciones de un pedido
      subscribeToOrder('order-id-123')
      
      return () => {
        // Desuscribirse al desmontar
        unsubscribeFromOrder('order-id-123')
      }
    }
  }, [isConnected, subscribeToOrder, unsubscribeFromOrder])
  
  // Escuchar mensajes
  useEffect(() => {
    if (lastMessage) {
      console.log('Nueva notificación:', lastMessage)
      // lastMessage contiene: type, order_id, title, message, status, etc.
    }
  }, [lastMessage])
}
```

### Tipos de Mensajes

El WebSocket envía diferentes tipos de mensajes según el estado del pedido:

- `order_created` - Nuevo pedido creado
- `order_confirmed` - Pedido confirmado
- `order_cooking` - Pedido en cocina
- `order_ready` - Pedido listo
- `order_in_delivery` - Pedido en camino
- `order_delivered` - Pedido entregado
- `order_update` - Actualización genérica

### Notificaciones Automáticas

El `WebSocketProvider` muestra automáticamente notificaciones toast cuando se reciben mensajes del WebSocket.

## Ejemplo de Uso

```typescript
import { apiClient } from '@/lib/api'
import { useWebSocketContext } from '@/lib/websocket-context'

// Login
const loginResponse = await apiClient.auth.login('usuario@200millas.com', 'password123')
// Retorna: { token, email, name, user_type, expires_in }

// Crear pedido
const order = await apiClient.orders.create({
  items: [
    { item_id: 'combo-1', name: 'Combo Mega', quantity: 1, price: 29.99 }
  ],
  delivery_address: 'Av. Principal 123',
  delivery_instructions: 'Tocar timbre'
})

// Suscribirse a actualizaciones del pedido
const { subscribeToOrder } = useWebSocketContext()
subscribeToOrder(order.order_id)

// Obtener pedido actual
const currentOrder = await apiClient.orders.getCurrent()
// Retorna: { has_active_order: true, order: {...} }

// Obtener perfil
const profile = await apiClient.profile.get()
```

