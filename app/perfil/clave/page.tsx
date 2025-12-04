"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeOff, Eye, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

export default function ClavePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isLoading, isAuthenticated])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    if (currentPassword === newPassword) {
      toast.error("La nueva contraseña debe ser diferente a la actual")
      return
    }

    setIsChanging(true)
    try {
      await apiClient.profile.changePassword(currentPassword, newPassword)
      toast.success("Contraseña actualizada correctamente", {
        description: "Tu contraseña ha sido cambiada exitosamente."
      })
      // Limpiar campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      const errorMessage = error?.message || "Error al cambiar la contraseña"
      toast.error("Error al cambiar contraseña", {
        description: errorMessage
      })
    } finally {
      setIsChanging(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="p-4 md:p-6 min-h-[464px]">
      <div className="w-full">
        <p className="text-gray-500 text-sm mb-6">Si requieres modificar tu contraseña, asegúrate de que sea segura.</p>

        <form onSubmit={handleChangePassword}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-4">
                  <div className="relative">
                      <Input 
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Contraseña actual" 
                          className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                          required
                      />
                      <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                          {showCurrentPassword ? (
                              <Eye className="w-4 h-4 text-gray-400" />
                          ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                      </button>
                  </div>
                  <div className="relative">
                      <Input 
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nueva contraseña" 
                          className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                          required
                          minLength={6}
                      />
                      <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                          {showNewPassword ? (
                              <Eye className="w-4 h-4 text-gray-400" />
                          ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                      </button>
                  </div>
                  <div className="relative">
                      <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmar nueva contraseña" 
                          className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                          required
                          minLength={6}
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                          {showConfirmPassword ? (
                              <Eye className="w-4 h-4 text-gray-400" />
                          ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                      </button>
                  </div>

                  <div className="mt-6">
                      <Button 
                          type="submit"
                          disabled={isChanging}
                          className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-6 py-6 rounded-lg text-sm disabled:opacity-50"
                      >
                          {isChanging ? (
                              <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cambiando...
                              </>
                          ) : (
                              "Confirmar contraseña"
                          )}
                      </Button>
                  </div>
              </div>

              <div className="w-full md:w-auto">
                  <Button 
                      type="button"
                      className="bg-[#e2e200] hover:bg-[#d4d400] text-[#1000a3] font-bold px-6 py-2 rounded-lg text-sm w-full md:w-auto"
                      onClick={() => toast.info("Funcionalidad de recuperación de contraseña próximamente")}
                  >
                      Recuperar contraseña
                  </Button>
              </div>
          </div>
        </form>
      </div>
    </div>
  )
}

