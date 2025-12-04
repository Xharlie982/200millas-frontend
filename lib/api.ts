const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://glsnif507b.execute-api.us-east-1.amazonaws.com/dev"

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Mock storage helper
const getMockOrders = () => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("mock_orders")
  return stored ? JSON.parse(stored) : []
}

const saveMockOrder = (order: any) => {
  if (typeof window === "undefined") return
  const orders = getMockOrders()
  orders.push({ ...order, id: order.id || "ORD-" + Date.now() })
  localStorage.setItem("mock_orders", JSON.stringify(orders))
}

// Helper to extract data from backend response
const extractData = (response: any) => {
  if (response.success && response.data) {
    return response.data
  }
  return response
}

export const apiClient = {
  // Orders endpoints
  orders: {
    create: async (orderData: any) => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to create order" }))
        throw new Error(error.message || "Failed to create order")
      }
      const result = await response.json()
      return extractData(result)
    },
    getById: async (orderId: string) => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch order" }))
        throw new Error(error.message || "Failed to fetch order")
      }
      const result = await response.json()
      return extractData(result)
    },
    getAll: async (filters?: any) => {
      try {
        // Construir URL con parámetros solo si hay filtros válidos
        let url = `${API_BASE_URL}/orders`
        if (filters && Object.keys(filters).length > 0) {
          const params = new URLSearchParams()
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              params.append(key, String(value))
            }
          })
          if (params.toString()) {
            url += `?${params.toString()}`
          }
        }
        
        const response = await fetch(url, {
          headers: getAuthHeaders(),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Failed to fetch orders" }))
          throw new Error(error.message || "Failed to fetch orders")
        }
        
        let result
        try {
          const responseText = await response.text()
          result = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
        }
        
        // Manejar respuesta de Lambda (con body_json o body)
        let actualBody = result
        if (result.body_json && typeof result.body_json === 'object') {
          actualBody = result.body_json
        } else if (result.body && typeof result.body === 'string') {
          try {
            actualBody = JSON.parse(result.body)
          } catch (e) {
            throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
          }
        } else if (result.statusCode && result.body) {
          try {
            actualBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
          } catch (e) {
            throw new Error("Respuesta inválida del servidor: formato de respuesta no reconocido")
          }
        }
        
        const data = extractData(actualBody)
        
        // El backend devuelve un array directamente o { success: true, data: [...] }
        // Asegurar que siempre devolvamos un array
        if (Array.isArray(data)) {
          return data
        } else if (data && Array.isArray(data.data)) {
          return data.data
        } else if (data && Array.isArray(data.items)) {
          return data.items
        } else {
          console.warn("Unexpected orders response format:", data)
          return []
        }
      } catch (error: any) {
        // Si es un error de red (CORS, conexión, etc.), lanzar error específico
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error("Network error: Unable to connect to server")
        }
        throw error
      }
    },
    getCurrent: async () => {
      const response = await fetch(`${API_BASE_URL}/orders/current`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch current order" }))
        throw new Error(error.message || "Failed to fetch current order")
      }
      const result = await response.json()
      return extractData(result)
    },
    getStatus: async (orderId: string) => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch order status" }))
        throw new Error(error.message || "Failed to fetch order status")
      }
      const result = await response.json()
      return extractData(result)
    },
    updateStatus: async (orderId: string, status: string, notes?: string) => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to update order status" }))
        throw new Error(error.message || "Failed to update order status")
      }
      const result = await response.json()
      return extractData(result)
    },
  },

  // Menu endpoints
  menu: {
    getCategories: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/menu/categories`, {
          headers: getAuthHeaders(),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Failed to fetch categories" }))
          throw new Error(error.message || "Failed to fetch categories")
        }
        const result = await response.json()
        return extractData(result)
      } catch (error: any) {
        // Si es un error de red (CORS, conexión, etc.), lanzar error específico
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error("Network error: Unable to connect to server")
        }
        throw error
      }
    },
    getItems: async (categoryId?: string) => {
      try {
        const url = categoryId ? `${API_BASE_URL}/menu/items?category=${categoryId}` : `${API_BASE_URL}/menu/items`
        const response = await fetch(url, {
          headers: getAuthHeaders(),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Failed to fetch menu items" }))
          throw new Error(error.message || "Failed to fetch menu items")
        }
        const result = await response.json()
        const data = extractData(result)
        // Asegurar que siempre devolvamos un array
        return Array.isArray(data) ? data : []
      } catch (error: any) {
        // Si es un error de red (CORS, conexión, etc.), lanzar error específico
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error("Network error: Unable to connect to server")
        }
        throw error
      }
    },
  },

  // Workflow endpoints - Enhanced with POST for step updates
  workflow: {
    getSteps: async (orderId: string) => {
      const response = await fetch(`${API_BASE_URL}/workflow${orderId ? `/${orderId}/steps` : ""}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch workflow steps")
      return response.json()
    },
    updateStep: async (orderId: string, stepId: string, data: any) => {
      const response = await fetch(`${API_BASE_URL}/workflow/${orderId}/steps/${stepId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString(),
        }),
      })
      if (!response.ok) throw new Error("Failed to update workflow step")
      return response.json()
    },
  },

  // Auth endpoints
  auth: {
    register: async (email: string, password: string, name: string, userType: string = "customer") => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, user_type: userType }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Registration failed" }))
        throw new Error(error.message || "Registration failed")
      }
      const result = await response.json()
      return extractData(result)
    },
    login: async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        
        // Si la respuesta no es OK, extraer el mensaje de error
        if (!response.ok) {
          let errorMessage = "Email o password incorrecto"
          try {
            const errorData = await response.json()
            // El backend devuelve { success: false, error: "mensaje" } o { message: "mensaje" }
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {
            // Si no se puede parsear el JSON, usar el mensaje por defecto
          }
          throw new Error(errorMessage)
        }
        
        // Parsear respuesta exitosa
        let result
        try {
          const responseText = await response.text()
          console.log("Login response text (raw):", responseText)
          
          if (!responseText || responseText.trim() === '') {
            throw new Error("Respuesta vacía del servidor")
          }
          
          result = JSON.parse(responseText)
        } catch (parseError: any) {
          console.error("Error parsing login response:", parseError)
          console.error("Response status:", response.status)
          console.error("Response headers:", Object.fromEntries(response.headers.entries()))
          throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
        }
        
        console.log("Login response (parsed):", JSON.stringify(result, null, 2))
        
        // API Gateway puede devolver la respuesta completa de Lambda con statusCode, headers, body, body_json
        // Necesitamos extraer el contenido real del body
        let actualBody = result
        
        // Si la respuesta tiene body_json (objeto parseado), usarlo
        if (result.body_json && typeof result.body_json === 'object') {
          console.log("Using body_json from Lambda response")
          actualBody = result.body_json
        }
        // Si la respuesta tiene body (string JSON), parsearlo
        else if (result.body && typeof result.body === 'string') {
          console.log("Parsing body string from Lambda response")
          try {
            actualBody = JSON.parse(result.body)
          } catch (e) {
            console.error("Error parsing body string:", e)
            throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
          }
        }
        // Si la respuesta tiene statusCode, headers, etc., es la respuesta completa de Lambda
        // y necesitamos extraer el body
        else if (result.statusCode && result.body) {
          console.log("Lambda response detected, extracting body")
          try {
            actualBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
          } catch (e) {
            console.error("Error parsing Lambda body:", e)
            throw new Error("Respuesta inválida del servidor: formato de respuesta no reconocido")
          }
        }
        
        console.log("Actual body extracted:", JSON.stringify(actualBody, null, 2))
        
        // Verificar si es un error ANTES de procesar
        if (actualBody && actualBody.success === false) {
          const errorMsg = actualBody.error || actualBody.message || "Error de autenticación"
          console.error("Backend returned error:", errorMsg)
          throw new Error(errorMsg)
        }
        
        // El backend devuelve { success: true, data: { token, email, name, user_type } }
        const data = extractData(actualBody)
        console.log("Extracted data:", JSON.stringify(data, null, 2))
        
        // Verificar si extractData devolvió un error
        if (data && data.success === false) {
          const errorMsg = data.error || data.message || "Error de autenticación"
          console.error("Extracted data contains error:", errorMsg)
          throw new Error(errorMsg)
        }
        
        // Validar que la respuesta tenga token
        if (!data || typeof data !== 'object') {
          console.error("Invalid login response - no data or not an object:", actualBody)
          throw new Error("Respuesta inválida del servidor: no se recibieron datos válidos")
        }
        
        if (!data.token) {
          console.error("Invalid login response - missing token. Actual body:", JSON.stringify(actualBody, null, 2))
          console.error("Extracted data:", JSON.stringify(data, null, 2))
          
          // Si hay un mensaje de error en la respuesta, usarlo
          if (data.error || data.message || actualBody.error || actualBody.message) {
            const errorMsg = data.error || data.message || actualBody.error || actualBody.message
            throw new Error(errorMsg || "Error de autenticación")
          }
          throw new Error("Respuesta inválida del servidor: no se recibió token de autenticación")
        }
        
        console.log("Login successful, token received")
        return data
      } catch (error: any) {
        // Si es un error de red (CORS, conexión, etc.), lanzar error específico
        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
          throw new Error("No se pudo conectar con el servidor. Por favor verifica tu conexión.")
        }
        // Re-lanzar otros errores tal como están
        throw error
      }
    },
    logout: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        })
        if (!response.ok) throw new Error("Logout failed")
        const result = await response.json()
        return extractData(result)
      } catch (error) {
        console.warn("Logout API call failed, clearing local session anyway", error)
        return { success: true }
      }
    },
  },

  // User Profile endpoints
  profile: {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        let errorMessage = "Failed to fetch profile"
        try {
          const errorData = await response.json().catch(() => ({ message: errorMessage }))
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // Si no se puede parsear, usar el mensaje por defecto
        }
        throw new Error(errorMessage)
      }
      
      let result
      try {
        const responseText = await response.text()
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      // Manejar respuesta de Lambda (con body_json o body)
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      } else if (result.statusCode && result.body) {
        try {
          actualBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
        } catch (e) {
          throw new Error("Respuesta inválida del servidor: formato de respuesta no reconocido")
        }
      }
      
      // Verificar si es un error
      if (actualBody && actualBody.success === false) {
        const errorMsg = actualBody.error || actualBody.message || "Error al obtener perfil"
        throw new Error(errorMsg)
      }
      
      const data = extractData(actualBody)
      
      // Verificar si extractData devolvió un error
      if (data && data.success === false) {
        const errorMsg = data.error || data.message || "Error al obtener perfil"
        throw new Error(errorMsg)
      }
      
      // El backend devuelve el perfil directamente en data
      return data
    },
    update: async (userData: any) => {
      const headers = getAuthHeaders()
      console.log("Updating profile with headers:", headers)
      console.log("Updating profile with data:", userData)
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(userData),
      })
      
      console.log("Profile update response status:", response.status)
      console.log("Profile update response ok:", response.ok)
      
      if (!response.ok) {
        let errorMessage = "Failed to update profile"
        try {
          const responseText = await response.text()
          console.log("Error response text:", responseText)
          const errorData = JSON.parse(responseText)
          
          // Manejar respuesta de Lambda con body_json o body
          let actualErrorBody = errorData
          if (errorData.body_json && typeof errorData.body_json === 'object') {
            actualErrorBody = errorData.body_json
          } else if (errorData.body && typeof errorData.body === 'string') {
            try {
              actualErrorBody = JSON.parse(errorData.body)
            } catch (e) {
              // Si no se puede parsear, usar errorData
            }
          }
          
          errorMessage = actualErrorBody.error || actualErrorBody.message || errorMessage
        } catch {
          // Si no se puede parsear, usar el mensaje por defecto
        }
        throw new Error(errorMessage)
      }
      
      let result
      try {
        const responseText = await response.text()
        console.log("Profile update response text (raw):", responseText)
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing profile update response:", parseError)
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      console.log("Profile update response (parsed):", JSON.stringify(result, null, 2))
      
      // Manejar respuesta de Lambda (con body_json o body)
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        console.log("Using body_json from Lambda response")
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        console.log("Parsing body string from Lambda response")
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          console.error("Error parsing body string:", e)
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      } else if (result.statusCode && result.body) {
        console.log("Lambda response detected, extracting body")
        try {
          actualBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
        } catch (e) {
          console.error("Error parsing Lambda body:", e)
          throw new Error("Respuesta inválida del servidor: formato de respuesta no reconocido")
        }
      }
      
      console.log("Actual body extracted:", JSON.stringify(actualBody, null, 2))
      
      // Verificar si es un error antes de procesar
      if (actualBody && actualBody.success === false) {
        const errorMsg = actualBody.error || actualBody.message || "Error al actualizar perfil"
        console.error("Backend returned error:", errorMsg)
        throw new Error(errorMsg)
      }
      
      const data = extractData(actualBody)
      console.log("Extracted data:", JSON.stringify(data, null, 2))
      
      // Verificar si extractData devolvió un error
      if (data && data.success === false) {
        const errorMsg = data.error || data.message || "Error al actualizar perfil"
        console.error("Extracted data contains error:", errorMsg)
        throw new Error(errorMsg)
      }
      
      // El backend devuelve { success: true, data: { message, profile } }
      // Necesitamos extraer el profile
      if (data && typeof data === 'object') {
        // Si data tiene profile, usarlo
        if (data.profile && typeof data.profile === 'object') {
          console.log("Returning profile from data.profile")
          return data.profile
        }
        // Si data tiene email directamente, es el perfil
        if (data.email) {
          console.log("Returning data as profile (has email)")
          return data
        }
        // Si data tiene message pero no profile, puede que el perfil esté en otro lugar
        if (data.message) {
          console.log("Response has message, checking for profile in actualBody")
          // Intentar obtener el perfil del actualBody directamente
          if (actualBody && actualBody.data && actualBody.data.profile) {
            console.log("Found profile in actualBody.data.profile")
            return actualBody.data.profile
          }
          // Si no hay profile, devolver data de todas formas (puede tener otros campos)
          console.log("No profile found, returning data with message")
          return data
        }
      }
      
      // Si extractData devolvió un objeto vacío, intentar obtener los datos directamente de actualBody
      if (!data || Object.keys(data).length === 0) {
        console.log("extractData returned empty, trying actualBody.data directly")
        if (actualBody && actualBody.data) {
          if (actualBody.data.profile) {
            console.log("Found profile in actualBody.data.profile")
            return actualBody.data.profile
          }
          if (actualBody.data.email) {
            console.log("Found profile data in actualBody.data")
            return actualBody.data
          }
        }
        // Si actualBody tiene success: true y data, pero extractData falló, intentar directamente
        if (actualBody && actualBody.success && actualBody.data) {
          console.log("Using actualBody.data directly")
          return actualBody.data.profile || actualBody.data
        }
      }
      
      console.error("Unexpected response format. actualBody:", JSON.stringify(actualBody, null, 2))
      console.error("Extracted data:", JSON.stringify(data, null, 2))
      throw new Error("Respuesta inválida del servidor: formato de respuesta no reconocido")
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      const headers = getAuthHeaders()
      console.log("Changing password with headers:", headers)
      
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      
      console.log("Change password response status:", response.status)
      
      if (!response.ok) {
        let errorMessage = "Failed to change password"
        try {
          const responseText = await response.text()
          console.log("Error response text:", responseText)
          const errorData = JSON.parse(responseText)
          
          // Manejar respuesta de Lambda con body_json o body
          let actualErrorBody = errorData
          if (errorData.body_json && typeof errorData.body_json === 'object') {
            actualErrorBody = errorData.body_json
          } else if (errorData.body && typeof errorData.body === 'string') {
            try {
              actualErrorBody = JSON.parse(errorData.body)
            } catch (e) {
              // Si no se puede parsear, usar errorData
            }
          }
          
          errorMessage = actualErrorBody.error || actualErrorBody.message || errorMessage
        } catch {
          // Si no se puede parsear, usar el mensaje por defecto
        }
        throw new Error(errorMessage)
      }
      
      let result
      try {
        const responseText = await response.text()
        console.log("Change password response text (raw):", responseText)
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing change password response:", parseError)
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      console.log("Change password response (parsed):", JSON.stringify(result, null, 2))
      
      // Manejar respuesta de Lambda (con body_json o body)
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        console.log("Using body_json from Lambda response")
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        console.log("Parsing body string from Lambda response")
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          console.error("Error parsing body string:", e)
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      } else if (result.statusCode && result.body) {
        console.log("Lambda response detected, extracting body")
        try {
          actualBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
        } catch (e) {
          console.error("Error parsing Lambda body:", e)
          throw new Error("Respuesta inválida del servidor: formato de respuesta no reconocido")
        }
      }
      
      console.log("Actual body extracted:", JSON.stringify(actualBody, null, 2))
      
      // Verificar si es un error antes de procesar
      if (actualBody && actualBody.success === false) {
        const errorMsg = actualBody.error || actualBody.message || "Error al cambiar contraseña"
        console.error("Backend returned error:", errorMsg)
        throw new Error(errorMsg)
      }
      
      const data = extractData(actualBody)
      console.log("Extracted data:", JSON.stringify(data, null, 2))
      
      // El backend devuelve { success: true, data: { message: "..." } }
      return data
    },
  },

  // Dashboard endpoints
  dashboard: {
    getSummary: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch dashboard summary" }))
        throw new Error(error.message || "Failed to fetch dashboard summary")
      }
      const result = await response.json()
      return extractData(result)
    },
    getTimeline: async (orderId: string) => {
      const response = await fetch(`${API_BASE_URL}/dashboard/timeline/${orderId}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch timeline" }))
        throw new Error(error.message || "Failed to fetch timeline")
      }
      const result = await response.json()
      return extractData(result)
    },
    getStaffPerformance: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/staff-performance`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch staff performance" }))
        throw new Error(error.message || "Failed to fetch staff performance")
      }
      const result = await response.json()
      return extractData(result)
    },
  },

  // Addresses endpoints
  addresses: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch addresses" }))
        throw new Error(error.message || "Failed to fetch addresses")
      }
      let result
      try {
        const responseText = await response.text()
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      // Manejar respuesta de Lambda
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      }
      
      if (actualBody && actualBody.success === false) {
        throw new Error(actualBody.error || actualBody.message || "Error al obtener direcciones")
      }
      
      return extractData(actualBody)
    },
    create: async (addressData: {
      label?: string
      street: string
      district: string
      city: string
      postal_code?: string
      reference?: string
      is_default?: boolean
    }) => {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to create address" }))
        throw new Error(error.message || "Failed to create address")
      }
      let result
      try {
        const responseText = await response.text()
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      // Manejar respuesta de Lambda
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      }
      
      if (actualBody && actualBody.success === false) {
        throw new Error(actualBody.error || actualBody.message || "Error al crear dirección")
      }
      
      return extractData(actualBody)
    },
    update: async (addressId: string, addressData: {
      label?: string
      street?: string
      district?: string
      city?: string
      postal_code?: string
      reference?: string
      is_default?: boolean
    }) => {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to update address" }))
        throw new Error(error.message || "Failed to update address")
      }
      let result
      try {
        const responseText = await response.text()
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      // Manejar respuesta de Lambda
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      }
      
      if (actualBody && actualBody.success === false) {
        throw new Error(actualBody.error || actualBody.message || "Error al actualizar dirección")
      }
      
      return extractData(actualBody)
    },
    delete: async (addressId: string) => {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to delete address" }))
        throw new Error(error.message || "Failed to delete address")
      }
      let result
      try {
        const responseText = await response.text()
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Respuesta inválida del servidor: no se pudo parsear la respuesta JSON")
      }
      
      // Manejar respuesta de Lambda
      let actualBody = result
      if (result.body_json && typeof result.body_json === 'object') {
        actualBody = result.body_json
      } else if (result.body && typeof result.body === 'string') {
        try {
          actualBody = JSON.parse(result.body)
        } catch (e) {
          throw new Error("Respuesta inválida del servidor: no se pudo parsear el body")
        }
      }
      
      if (actualBody && actualBody.success === false) {
        throw new Error(actualBody.error || actualBody.message || "Error al eliminar dirección")
      }
      
      return extractData(actualBody)
    },
  },
}
