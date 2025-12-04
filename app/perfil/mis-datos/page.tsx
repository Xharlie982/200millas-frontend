"use client"

import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Info, CalendarIcon, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

// Extend user type locally if needed or cast
interface ExtendedUser {
  name?: string
  email?: string
  phoneNumber?: string
  dni?: string
  birthDate?: string
  pronoun?: string
  [key: string]: any
}

export default function MisDatosPage() {
  const { isAuthenticated, isLoading, user, logout, setUser } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [pronoun, setPronoun] = useState("")

  useEffect(() => {
    setMounted(true)
    
    // Solo redirigir si realmente no hay token (no solo si isAuthenticated es false)
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token")
    if (!isLoading && !isAuthenticated && !hasToken) {
      console.log("No token found, redirecting to login")
      redirect("/login")
      return
    }
    
    const loadProfile = async () => {
      // Intentar cargar el perfil si hay token, incluso si isAuthenticated es false temporalmente
      const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token")
      if (isAuthenticated || hasToken) {
        setIsLoadingProfile(true)
        try {
          // Cargar perfil completo del backend
          const profile = await apiClient.profile.get()
          console.log("Profile loaded from backend:", profile)
          
          // Actualizar el usuario en el contexto con el perfil completo
          const updatedUser = {
            email: profile.email || user?.email,
            name: profile.name || user?.name,
            userType: profile.user_type || user?.userType,
            tenantId: user?.tenantId || "200millas",
            phone: profile.phone,
            phoneNumber: profile.phone, // Compatibilidad
            preferences: profile.preferences || {},
          }
          
          setUser(updatedUser as any)
          localStorage.setItem("user", JSON.stringify(updatedUser))
          
          // Cargar datos en el formulario
          const names = profile.name?.split(" ") || ["", ""]
          setFirstName(names[0] || "")
          setLastName(names.slice(1).join(" ") || "")
          setPhone(profile.phone || "")
          setEmail(profile.email || "")
          
          // Cargar campos de preferences
          if (profile.preferences) {
            if (profile.preferences.dni) setDni(profile.preferences.dni)
            if (profile.preferences.pronoun) setPronoun(profile.preferences.pronoun)
            if (profile.preferences.birthDate) {
              setDate(new Date(profile.preferences.birthDate))
            }
          }
        } catch (error: any) {
          // Manejar errores de forma más robusta
          // Extraer el mensaje de error de múltiples formas posibles
          let errorMessage = ""
          try {
            if (error?.message) {
              errorMessage = String(error.message)
            } else if (typeof error === 'string') {
              errorMessage = error
            } else if (error?.toString && typeof error.toString === 'function') {
              errorMessage = error.toString()
            } else if (error && typeof error === 'object') {
              // Intentar extraer de diferentes propiedades
              errorMessage = error.error || error.msg || error.text || JSON.stringify(error)
            } else {
              errorMessage = String(error) || "Error desconocido al cargar perfil"
            }
          } catch (e) {
            errorMessage = "Error al procesar el error"
          }
          
          // hasToken ya está definido en el scope de loadProfile (línea 72)
          const errorDetails = {
            message: errorMessage,
            stack: error?.stack || "No stack trace available",
            user: user?.email || "No user",
            hasToken: hasToken,
            errorType: error?.constructor?.name || typeof error,
            rawError: error ? (typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error)) : "No error object"
          }
          
          console.error("Error loading profile:", error)
          console.error("Error details:", errorDetails)
          
          // Solo limpiar sesión si el error es específicamente "Usuario no encontrado para email: ..."
          // PERO solo si NO hay token válido (es decir, si el login no fue exitoso)
          const isUserNotFoundError = errorMessage.includes("Usuario no encontrado") && 
                                     errorMessage.includes("email:") &&
                                     errorMessage.includes("@")
          
          // Solo limpiar sesión si el usuario no existe Y no hay token válido
          // Si hay token, significa que el login fue exitoso, así que el usuario debería existir
          // En este caso, puede ser un problema temporal - no limpiar la sesión
          if (isUserNotFoundError && !hasToken) {
            console.log("Usuario no encontrado en backend y no hay token - limpiando sesión...")
            
            // Limpiar sesión
            localStorage.removeItem("user")
            localStorage.removeItem("token")
            setUser(null)
            
            // Redirigir al login después de un breve delay
            setTimeout(() => {
              window.location.href = "/login"
            }, 1000)
            
            return
          } else if (isUserNotFoundError && hasToken) {
            // Si hay token pero el usuario no existe, puede ser un problema de sincronización
            // O el usuario se registró en otra instancia
            console.warn("Usuario no encontrado pero hay token válido - puede ser un problema temporal o el usuario no existe en esta instancia")
            toast.warning("Usuario no encontrado", {
              description: "El usuario no existe en esta instancia. Por favor, regístrate primero o contacta al administrador.",
              duration: 5000
            })
            
            // No limpiar la sesión automáticamente, pero mostrar un mensaje claro
            // El usuario puede decidir si quiere cerrar sesión o registrarse
          }
          
          // Para otros errores (red, timeout, 401, etc.), NO limpiar sesión
          // Solo usar datos del usuario en el contexto si están disponibles
          console.log("Error no crítico, usando datos del usuario en contexto")
          if (user) {
            const currentUser = user as ExtendedUser
            const names = user.name?.split(" ") || ["", ""]
            setFirstName(names[0] || "")
            setLastName(names.slice(1).join(" ") || "")
            setPhone(user.phone || user.phoneNumber || "")
            setEmail(user.email || "")
            
            if (currentUser.preferences) {
              if (currentUser.preferences.dni) setDni(currentUser.preferences.dni)
              if (currentUser.preferences.pronoun) setPronoun(currentUser.preferences.pronoun)
              if (currentUser.preferences.birthDate) {
                setDate(new Date(currentUser.preferences.birthDate))
              }
            }
          }
        } finally {
          setIsLoadingProfile(false)
        }
      } else {
        setIsLoadingProfile(false)
      }
    }
    
    loadProfile()
  }, [isLoading, isAuthenticated])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // El backend solo acepta: name, phone, address, preferences
      // Mapear los campos del formulario a los que acepta el backend
      const updatedData: any = {
        name: `${firstName} ${lastName}`.trim(),
      }
      
      // Solo incluir phone si tiene valor
      if (phone && phone.trim()) {
        updatedData.phone = phone.trim()
      }
      
      // Guardar campos adicionales en preferences (el backend los acepta)
      const preferences: any = {}
      if (dni && dni.trim()) {
        preferences.dni = dni.trim()
      }
      if (date) {
        preferences.birthDate = date.toISOString()
      }
      if (pronoun && pronoun.trim()) {
        preferences.pronoun = pronoun.trim()
      }
      
      if (Object.keys(preferences).length > 0) {
        updatedData.preferences = preferences
      }

      console.log("Updating profile with data:", updatedData)
      
      const response = await apiClient.profile.update(updatedData)
      console.log("Profile update response:", response)
      
      // El backend devuelve el perfil actualizado directamente
      // o puede venir como { profile: {...} }
      const updatedProfile = response.profile || response
      console.log("Updated profile extracted:", updatedProfile)
      
      if (!updatedProfile) {
        console.error("No profile in response:", response)
        throw new Error("Respuesta inválida del servidor: no se recibió el perfil")
      }
      
      // El perfil debe tener al menos email para ser válido
      if (!updatedProfile.email) {
        console.error("Profile missing email:", updatedProfile)
        throw new Error("Respuesta inválida del servidor: el perfil no contiene email")
      }
      
      // Actualizar el usuario en el contexto sin desloguear
      // Mantener el mismo formato que el login
      const updatedUser = {
        email: updatedProfile.email,
        name: updatedProfile.name || updatedData.name,
        userType: updatedProfile.user_type || user?.userType,
        tenantId: user?.tenantId || "200millas",
        // Campos adicionales del perfil
        phone: updatedProfile.phone,
        phoneNumber: updatedProfile.phone, // Mantener compatibilidad
        preferences: updatedProfile.preferences || preferences,
      }
      
      // Actualizar contexto y localStorage
      setUser(updatedUser as any)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      // Actualizar los campos del formulario con los valores del servidor
      const names = updatedProfile.name?.split(" ") || [updatedData.name, ""]
      setFirstName(names[0] || "")
      setLastName(names.slice(1).join(" ") || "")
      setPhone(updatedProfile.phone || "")
      
      // Actualizar campos de preferences
      if (updatedProfile.preferences) {
        if (updatedProfile.preferences.dni) setDni(updatedProfile.preferences.dni)
        if (updatedProfile.preferences.pronoun) setPronoun(updatedProfile.preferences.pronoun)
        if (updatedProfile.preferences.birthDate) {
          setDate(new Date(updatedProfile.preferences.birthDate))
        }
      }

      toast.success("Datos actualizados correctamente", {
        description: "Tu información ha sido guardada exitosamente."
      })
    } catch (error: any) {
        console.error("Error updating profile:", error)
        const errorMessage = error?.message || "No se pudo guardar la información. Por favor, inténtalo de nuevo."
        toast.error("Error al actualizar", {
            description: errorMessage
        })
    } finally {
        setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await apiClient.profile.delete()
      await logout()
      toast.success("Cuenta eliminada", {
        description: "Lamentamos verte partir. Tu cuenta ha sido eliminada."
      })
      router.push("/login")
    } catch (error) {
      toast.error("Error al eliminar cuenta", {
        description: "No se pudo eliminar tu cuenta. Inténtalo de nuevo."
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isPageLoading = isLoading || !mounted || isLoadingProfile

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 relative">
        {/* Optional: Loading Overlay Spinner if desired, keeping form visible underneath */}
        {isPageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                <Loader2 className="h-10 w-10 animate-spin text-[#1000a3]" />
            </div>
        )}

        <div className={cn("w-full transition-opacity duration-300", isPageLoading ? "opacity-50 pointer-events-none select-none grayscale" : "opacity-100")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-medium ml-1">Nombre</Label>
                  <Input 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-medium ml-1">Apellido</Label>
                  <Input 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                  />
              </div>
              
              <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-medium ml-1">Número</Label>
                  <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-medium ml-1">Correo electrónico</Label>
                  <Input 
                      value={email}
                      disabled
                      className="h-11 bg-gray-200/50 border-gray-200 rounded-lg text-gray-500"
                  />
              </div>

              <div className="space-y-2 relative">
                  <div className="flex justify-between">
                      <Label className="text-xs text-gray-500 font-medium ml-1">DNI</Label>
                  </div>
                  <div className="relative">
                      <Input 
                          value={dni}
                          onChange={(e) => setDni(e.target.value)}
                          placeholder="" 
                          className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors pr-10"
                      />
                      <Tooltip>
                          <TooltipTrigger className="absolute right-3 top-1/2 -translate-y-1/2" type="button">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Acumula puntos en todos los canales.</p>
                          </TooltipContent>
                      </Tooltip>
                  </div>
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between">
                      <Label className="text-xs text-gray-500 font-medium ml-1">Fecha de nacimiento</Label>
                  </div>
                  <div className="relative">
                      <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                      "h-11 w-full justify-start text-left font-normal bg-gray-50 border-gray-200 rounded-lg hover:bg-white transition-colors pr-10",
                                      !date && "text-muted-foreground"
                                  )}
                              >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={(date) => {
                                      setDate(date)
                                      setOpen(false)
                                  }}
                                  initialFocus
                                  locale={es}
                                  captionLayout="dropdown"
                                  fromYear={1900}
                                  toYear={new Date().getFullYear()}
                              />
                          </PopoverContent>
                      </Popover>
                      <Tooltip>
                          <TooltipTrigger className="absolute right-3 top-1/2 -translate-y-1/2 z-10" type="button">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Adquiere ofertas exclusivas por tu día.</p>
                          </TooltipContent>
                      </Tooltip>
                  </div>
              </div>

              <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-medium ml-1">Pronombre</Label>
                  <Select value={pronoun} onValueChange={setPronoun}>
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                          <SelectItem value="el">Él</SelectItem>
                          <SelectItem value="ella">Ella</SelectItem>
                          <SelectItem value="elle">Elle</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

               <div className="flex flex-col justify-end h-full">
                   <div className="h-5 mb-2"></div> {/* Spacer for label alignment */}
                   
                   <Dialog>
                      <DialogTrigger asChild>
                          <Button 
                              className="w-full bg-[#1000a3] hover:bg-red-600 text-white font-bold transition-colors gap-2 cursor-pointer h-11 shadow-sm hover:shadow-md"
                          >
                              <Trash2 className="w-4 h-4" />
                              Eliminar cuenta
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>¿Estás absolutamente seguro?</DialogTitle>
                              <DialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá tus datos de nuestros servidores.
                              </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                              <DialogClose asChild>
                                  <Button type="button" variant="secondary" className="cursor-pointer">Cancelar</Button>
                              </DialogClose>
                              <Button 
                                  type="button" 
                                  variant="destructive" 
                                  onClick={handleDeleteAccount}
                                  disabled={isDeleting}
                                  className="cursor-pointer"
                              >
                                  {isDeleting ? (
                                      <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Eliminando...
                                      </>
                                  ) : (
                                      "Sí, eliminar cuenta"
                                  )}
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                   </Dialog>
              </div>
          </div>

          <div className="mt-8 flex justify-center md:justify-start">
              <Button 
                  className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-12 py-6 rounded-lg text-base w-full md:w-auto cursor-pointer"
                  onClick={handleSave}
                  disabled={isSaving}
              >
                  {isSaving ? (
                      <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                      </>
                  ) : (
                      "Guardar"
                  )}
              </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
