"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "./api"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  tenantId: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tenantId, setTenantId] = useState(process.env.NEXT_PUBLIC_TENANT_ID || "200millas")

  useEffect(() => {
    // Check if user is already logged in - pero solo si hay token válido
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    
    // Solo restaurar usuario si hay token (el token se valida en cada request)
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser)
        // Validar que el usuario tenga los campos mínimos
        if (user && user.email) {
          setUser(user)
          // No verificar el perfil automáticamente aquí - se verificará cuando sea necesario
          // (por ejemplo, cuando el usuario vaya a la página de perfil)
        } else {
          // Si el usuario no es válido, limpiar todo
          localStorage.removeItem("user")
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    } else if (storedUser && !storedToken) {
      // Si hay usuario pero no token, limpiar (sesión inválida)
      localStorage.removeItem("user")
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    // Limpiar cualquier sesión previa antes de intentar login
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    
    try {
      const response = await apiClient.auth.login(email, password)
      
      // Validar que la respuesta tenga los campos necesarios
      if (!response || !response.token || !response.email) {
        console.error("Invalid login response:", response)
        throw new Error("Respuesta inválida del servidor: faltan datos de autenticación")
      }
      
      // Backend returns: { token, email, name, user_type, expires_in }
      // Esperar un momento para que el token se propague antes de obtener el perfil
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Obtener perfil completo del backend después del login (opcional)
      // Si falla, usamos los datos básicos del login
      let fullProfile = null
      try {
        // Intentar obtener el perfil completo con retry (solo 1 intento rápido)
        try {
          fullProfile = await apiClient.profile.get()
          console.log("Full profile loaded after login:", fullProfile)
        } catch (error: any) {
          // Si no se puede obtener el perfil, no es crítico - usaremos datos básicos
          console.warn("Could not load full profile after login, using basic info:", error?.message)
          // NO limpiar la sesión ni lanzar error - el login fue exitoso
        }
      } catch (error) {
        // Cualquier otro error también es no crítico
        console.warn("Error trying to load profile after login, using basic info:", error)
      }
      
      // Usar el perfil completo si está disponible, sino usar datos básicos
      const user = fullProfile ? {
        email: fullProfile.email || response.email,
        name: fullProfile.name || response.name,
        userType: fullProfile.user_type || response.user_type,
        tenantId: tenantId,
        phone: fullProfile.phone,
        phoneNumber: fullProfile.phone, // Compatibilidad
        preferences: fullProfile.preferences || {},
      } : {
        email: response.email,
        name: response.name,
        userType: response.user_type,
        tenantId: tenantId,
      }
      
      // Solo establecer usuario si tenemos token válido
      setUser(user as User)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", response.token)
      setTenantId(tenantId)
      
      console.log("Login successful for:", user.email)
      console.log("User state set, token stored:", {
        email: user.email,
        hasToken: !!response.token,
        userInState: user
      })
    } catch (error: any) {
      console.error("Login error:", error)
      // Asegurar que no quede ningún dato de sesión en caso de error
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      // Re-lanzar el error para que el componente lo maneje
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.auth.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
        tenantId,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
