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

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [pronoun, setPronoun] = useState("")

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
    if (user) {
      const currentUser = user as ExtendedUser
      const names = user.name?.split(" ") || ["", ""]
      setFirstName(names[0] || "")
      setLastName(names.slice(1).join(" ") || "")
      setPhone(user.phoneNumber || "")
      setEmail(user.email || "")
      
      // Initialize extended fields if they exist
      if (currentUser.dni) setDni(currentUser.dni)
      if (currentUser.pronoun) setPronoun(currentUser.pronoun)
      if (currentUser.birthDate) setDate(new Date(currentUser.birthDate))
    }
  }, [isLoading, isAuthenticated, user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedData = {
        name: `${firstName} ${lastName}`.trim(),
        phoneNumber: phone,
        dni: dni,
        birthDate: date ? date.toISOString() : undefined,
        pronoun: pronoun,
      }

      const response = await apiClient.profile.update(updatedData)
      
      // Update context and local storage with the response from the server
      const updatedUser = response.user;
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast.success("Datos actualizados correctamente", {
        description: "Tu información ha sido guardada exitosamente."
      })
    } catch (error) {
        toast.error("Error al actualizar", {
            description: "No se pudo guardar la información. Por favor, inténtalo de nuevo."
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

  const isPageLoading = isLoading || !mounted

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
