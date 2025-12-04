"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Address {
  address_id: string
  label: string
  street: string
  district: string
  city: string
  postal_code?: string
  reference?: string
  is_default: boolean
  created_at?: number
  updated_at?: number
}

function DireccionesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    district: "",
    city: "",
    postal_code: "",
    reference: "",
    is_default: false,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const loadAddresses = async () => {
    setIsLoadingAddresses(true)
    try {
      const data = await apiClient.addresses.getAll()
      setAddresses(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error loading addresses:", error)
      toast.error("Error al cargar direcciones", {
        description: error.message || "No se pudieron cargar las direcciones",
      })
      setAddresses([])
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        label: address.label || "",
        street: address.street || "",
        district: address.district || "",
        city: address.city || "",
        postal_code: address.postal_code || "",
        reference: address.reference || "",
        is_default: address.is_default || false,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        label: "",
        street: "",
        district: "",
        city: "",
        postal_code: "",
        reference: "",
        is_default: false,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAddress(null)
    setFormData({
      label: "",
      street: "",
      district: "",
      city: "",
      postal_code: "",
      reference: "",
      is_default: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.street || !formData.district || !formData.city) {
        toast.error("Campos requeridos", {
          description: "Por favor completa calle, distrito y ciudad",
        })
        setIsSubmitting(false)
        return
      }

      if (editingAddress) {
        await apiClient.addresses.update(editingAddress.address_id, formData)
        toast.success("Dirección actualizada", {
          description: "La dirección se ha actualizado correctamente",
        })
      } else {
        await apiClient.addresses.create(formData)
        toast.success("Dirección creada", {
          description: "La dirección se ha agregado correctamente",
        })
      }

      handleCloseDialog()
      loadAddresses()
    } catch (error: any) {
      console.error("Error saving address:", error)
      toast.error("Error al guardar dirección", {
        description: error.message || "No se pudo guardar la dirección",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta dirección?")) {
      return
    }

    try {
      await apiClient.addresses.delete(addressId)
      toast.success("Dirección eliminada", {
        description: "La dirección se ha eliminado correctamente",
      })
      loadAddresses()
    } catch (error: any) {
      console.error("Error deleting address:", error)
      toast.error("Error al eliminar dirección", {
        description: error.message || "No se pudo eliminar la dirección",
      })
    }
  }

  if (isLoading || isLoadingAddresses) {
    return (
      <div className="p-4 md:p-6 min-h-[464px] flex items-center justify-center">
        <div className="text-gray-500">Cargando direcciones...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 min-h-[464px]">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">Gestiona tus direcciones de entrega para tus pedidos.</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-[#1000a3] hover:bg-[#1000a3]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Dirección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "Editar Dirección" : "Nueva Dirección"}
                </DialogTitle>
                <DialogDescription>
                  {editingAddress
                    ? "Modifica los datos de tu dirección de entrega"
                    : "Agrega una nueva dirección para tus pedidos"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="label">Nombre de la dirección (opcional)</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ej: Casa, Trabajo, etc."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="street">Calle y número *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Ej: Av. Principal 123"
                    required
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">Distrito *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Ej: San Isidro"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ej: Lima"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postal_code">Código postal (opcional)</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="Ej: 15036"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Referencia (opcional)</Label>
                  <Textarea
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ej: Frente al parque, cerca del banco"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_default: checked === true })
                    }
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Usar como dirección predeterminada
                  </Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1000a3] hover:bg-[#1000a3]/90"
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : editingAddress
                      ? "Actualizar"
                      : "Agregar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <button
            onClick={() => handleOpenDialog()}
            className="w-full border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            <Plus className="w-6 h-6 mb-2 text-gray-400 group-hover:text-[#1000a3]" />
            <span className="text-sm">Añadir una dirección de entrega</span>
          </button>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.address_id}
                className="border border-gray-200 rounded-xl p-6 hover:border-[#1000a3] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#1000a3]" />
                      <h3 className="font-semibold text-lg">
                        {address.label || "Dirección"}
                        {address.is_default && (
                          <span className="ml-2 text-xs bg-[#1000a3] text-white px-2 py-1 rounded">
                            Predeterminada
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-gray-700 mb-1">{address.street}</p>
                    <p className="text-gray-600 text-sm">
                      {address.district}, {address.city}
                      {address.postal_code && ` - ${address.postal_code}`}
                    </p>
                    {address.reference && (
                      <p className="text-gray-500 text-sm mt-2 italic">
                        Referencia: {address.reference}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(address)}
                      className="text-[#1000a3] hover:text-[#1000a3] hover:bg-[#1000a3]/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.address_id)}
                      className="text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DireccionesPage
