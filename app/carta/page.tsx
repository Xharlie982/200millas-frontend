"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import CustomerHeader from "@/components/customer-header"
import CustomerFooter from "@/components/customer-footer"
import { ProductDetailModal } from "@/components/ProductDetailModal"
import { useCart } from "@/lib/cart-context"
import { apiClient } from "@/lib/api"
import type { MenuItem, MenuCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { Search, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { SimpleToast } from "@/components/ui/simple-toast"

export default function CartaPage() {
  const { addItem } = useCart()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadItems(selectedCategory)
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const data = await apiClient.menu.getCategories()
      setCategories(data)
      setError(null)
    } catch (error) {
      setError("No se pudo conectar con el servidor. Mostrando datos de ejemplo.")
      setCategories([
        { id: "1", name: "Promos Fast", description: "Promociones rápidas" },
        { id: "2", name: "Express", description: "Platos express" },
        { id: "3", name: "Promociones", description: "Ofertas" },
        { id: "4", name: "Sopas Power", description: "Sopas" },
        { id: "5", name: "Bowls Del Tigre", description: "Bowls" },
        { id: "6", name: "Leche de Tigre", description: "Leche de tigre" },
        { id: "7", name: "Ceviches", description: "Ceviches" },
        { id: "8", name: "Fritazo", description: "Frituras" },
        { id: "9", name: "Mostrimar", description: "Mariscos" },
        { id: "10", name: "Box Marino", description: "Box Marino" },
        { id: "11", name: "Dúos Marinos", description: "Dúos" },
        { id: "12", name: "Tríos Marinos", description: "Tríos" },
        { id: "13", name: "Dobles", description: "Dobles" },
        { id: "14", name: "Rondas Marinas", description: "Rondas" },
        { id: "15", name: "Mega Marino", description: "Mega" },
        { id: "16", name: "Familiares", description: "Familiares" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async (categoryId: string | null) => {
    try {
      const data = await apiClient.menu.getItems({ categoryId })
      setItems(data)
    } catch (error) {
      const mock: MenuItem[] = [
        // Promos Fast (category: "1")
        { id: "p1", name: "Promo Familiar Cevichero 4", description: "2 Ceviches clasicos + 1 Chicharron Pescado+ Arroz con mariscos + 2 porciones de yucas + 4 Chichas 12 Onz. Promocion solo valida por web y tamaño regular", price: 69.90, image: "/PF1.png", available: true, category: "1",
        configuracionOpciones: [
         {
           "id": "bebida",
           "name": "Elige tu bebida",
           "type": "checkbox",
           "required": true,
           "maxSelections": 4,
           "options": [
             { "id": "bebida-1", "name": "Chicha Morada 12 Oz.", "price": 0, "image": "/CM12Oz.png" },
             { "id": "bebida-2", "name": "Agrandar chicha 16oz", "price": 1, "image": "/CM16Oz.png" },
             { "id": "bebida-3", "name": "Coca Cola 300 ml", "price": 1.50, "image": "/CC300ml.png" },
             { "id": "bebida-4", "name": "Inka Kola 300 ml", "price": 1.50, "image": "/IK300ml.png" },
             { "id": "bebida-5", "name": "Agrandar Chicha 21oz", "price": 2, "image": "/CM21Oz.png" },
             { "id": "bebida-6", "name": "Agua San Luis 750 ml", "price": 3, "image": "/ASL750ml.png" },
             { "id": "bebida-7", "name": "Coca Cola 500 ml", "price": 3, "image": "/CC500ml.png" },
             { "id": "bebida-8", "name": "Inka Kola 500 ml", "price": 3, "image": "/IK500ml.png" }
           ]
         },
         {
           "id": "presentacion",
           "name": "Elige tu presentación",
           "type": "radio",
           "required": true,
           "options": [
             { "id": "presentacion-1", "name": "Promo Familiar Cevichero", "price": 0, "image": "/PFC.png" }
           ]
         },
         {
           "id": "aji",
           "name": "Elige tu nivel de ají",
           "type": "radio",
           "required": true,
           "options": [
             { "id": "aji-1", "name": "Picante normal", "price": 0, "image": "/PicanteNormal.png" },
             { "id": "aji-2", "name": "Sin ají", "price": 0, "image": "/SinAji.png" }
           ]
         },
         {
           "id": "adicionales",
           "name": "¿Deseas agregar algo más a tu pedido?",
           "type": "checkbox",
           "required": false,
           "options": [
             { "id": "adicional-1", "name": "Yuquita Regular 4 Und", "price": 4.9, "image": "/YR4und.png" },
             { "id": "adicional-2", "name": "Chicha Morada 12 Oz.", "price": 4.9, "image": "/CM12Oz.png" },
             { "id": "adicional-3", "name": "Chicha Morado 16 Oz.", "price": 5.9, "image": "/CM16Oz.png" },
             { "id": "adicional-4", "name": "Vaso Al Paso Leche de Tigre Pota c/yuquita", "price": 12.9, "image": "/VaPLdTPcy.png" },
             { "id": "adicional-5", "name": "Canchita Adicional", "price": 2.9, "image": "/CA.png" },
             { "id": "adicional-6", "name": "Yuquita Grande 7 Und", "price": 7.9, "image": "/YG7und.png" },
             { "id": "adicional-7", "name": "Chicharrón Clásico Extremo", "price": 12.9, "image": "/CCE.png" },
             { "id": "adicional-8", "name": "Chilcano Power c/Chicharron", "price": 7.9, "image": "/ChilcanoPowerconChicharron.png" },
             { "id": "adicional-9", "name": "Causa 200 Millas", "price": 9.9, "image": "/Causa200millas.png" },
             { "id": "adicional-10", "name": "Vaso Leche de Tigre Pescado Regular Adicional", "price": 11.9, "image": "/VLdTPRA.png" },
             { "id": "adicional-11", "name": "Chilcano Power", "price": 4.9, "image": "/ChilcanoPower.png" },
             { "id": "adicional-12", "name": "Vaso Al Paso Leche de Tigre Pota", "price": 9.9, "image": "/VaPLdTP.png" },
             { "id": "adicional-13", "name": "Chicharrón Clásico Regular", "price": 9.9, "image": "/CCR.png" },
             { "id": "adicional-14", "name": "Inka Kola Sabor Original 500 ml", "price": 5.9, "image": "/IK500ml.png" },
             { "id": "adicional-15", "name": "Yuquitas Regular + Chicha 12 Oz", "price": 7.9, "image": "/YRplusC12Oz.png" },
             { "id": "adicional-16", "name": "Coca Cola Sabor Original 500 ml", "price": 5.9, "image": "/CC500ml.png" },
             { "id": "adicional-17", "name": "Chicharrón de Pescado Extremo", "price": 10.9, "image": "/ChicharrondePescadoExtremo.png" },
             { "id": "adicional-18", "name": "Chicharrón de Pescado Regular", "price": 7.9, "image": "/ChicharrondePescadoRegular.png" },
             { "id": "adicional-19", "name": "Vaso Leche de Tigre Pota Regular Adicional", "price": 10.9, "image": "/VLdTPoRA.png" },
             { "id": "adicional-20", "name": "Chicha Morada 9 Onz", "price": 3.9, "image": "/CM9Oz.png" }
           ]
         }
       ]
      },
        { id: "p2", name: "Promo familiar Marino 3", description: "1 Trio clasico+ 1 Duo Tradicional + Arroz con mariscos + 3 Chichas 12 Onz. Promocion solo valida por web y tamaño regular", price: 64.9, image: "/PFM3.png", available: true, category: "1" },
        { id: "p3", name: "Promo Ronda Marina Mixta", description: "Ceviche de pescado + Chicharron de Pescado + Arroz con Mariscos + Chaufa de Mariscos + Causa + 2 Chichas de 12 Onz. Promocion valida solo en web. Imagenes referenciales.", price: 49.9, image: "/PRMM.png", available: true, category: "1" },
        { id: "p4", name: "Promo Megamarino Power", description: "Chicharron de pescado, pota y langostinos + Chaufa de mariscos + Papas fritas + 2 chilcanos. Promocion solo valida en la web.", price: 39.9, image: "/PMP.png", available: true, category: "1" },
        { id: "p5", name: "Promo Duo Clasico", description: "Ceviche de Pescado + Chicharron de Pota. Promocion solo valida por web y tamaño regular", price: 21.9, image: "/PDC.png", available: true, category: "1" },
        { id: "p6", name: "Promo Trio Clasico", description: "Ceviche de Pescado + Arroz con Mariscos + Chicharron de Pota. Promocion solo valida por web y tamaño regular. Imagen referencial", price: 23.9, image: "/PTC.png", available: true, category: "1" },
        
        // Express (category: "2")
        { id: "e1", name: "Express Chaufero", description: "Nuggets de pescado + chufa de mariscos + papas fritas", price: 13.99, image: "/ExpressChaufero.png", available: true, category: "2" },
        { id: "e2", name: "Express Marino", description: "Nuggets de pescado + Arroz Blanco + Sarza criolla", price: 10.9, image: "/ExpressMarino.png", available: true, category: "2" },
        { id: "e3", name: "Cono Pez", description: "Chicharron de pescado + Papas fritas + Chicha 12 Onz", price: 16.9, image: "/ConoPez.png", available: true, category: "2" },

        // Promociones (category: "3")
        { id: "pr1", name: "Promo Tradicional", description: "Ceviche de pescado + Chicharron de pot + 4 yuquitas + Chicha 12 oz. Elige entre Regular o Extremo. Imagenes referenciales.", price: 28.9, image: "/PromoTradicional.png", available: true, category: "3" },
        { id: "pr2", name: "Promo Pescado", description: "Ceviche de Pescado + Chicharron de pescado + 4 yuquitas + Chicha 12 oz. Elige entre Regular o Extremo. Imagenes referenciales.", price: 29.9, image: "/PromoPescado.png", available: true, category: "3" },
        { id: "pr3", name: "Menu Puerto Duo", description: "Ceviche de Pescado + Chicharron de Pescado", price: 18.9, image: "/MPD.png", available: true, category: "3" },
        { id: "pr4", name: "Promo Vaso Pota Extremo", description: "Leche de tigre con trozos de pota + Chicharron de pota regular + Chicha 12 oz. Imagenes referenciales.", price: 23.9, image: "/PVPE.png", available: true, category: "3" },
        { id: "pr5", name: "2x1 Vaso Puerto Regular", description: "2 Leches de Tigre clasico + 2 Chichas de 12 Onz. Elige regular o extremo. Imagenes referenciales.", price: 29.9, image: "/2x1VPR.png", available: true, category: "3" },
        { id: "pr6", name: "Promo Vaso Pota Regular", description: "Leche de tigre con trozos de pota + Chicharron de pota regular + Chicha 12 oz. Imagenes referenciales.", price: 19.9, image: "/PVPR.png", available: true, category: "3" },
        { id: "pr7", name: "Promo Cevichera", description: "Ceviche de pescado + chicharron de pota y pescado regular + Chicha 12 oz. Elige Regular o Extremo. Imagenes referenciales.", price: 29.9, image: "/PromoCevichera.png", available: true, category: "3" },
        { id: "pr8", name: "Menu Puerto Bowl", description: "Bowl de chaufa 16 Onz + Chicharron Clasico", price: 16.9, image: "/MPB.png", available: true, category: "3" },
        { id: "pr9", name: "Promo Combo del Tigre", description: "Chicharron de pota + yuquitas fritas + chifles + canchita + leche de tigre pescado regular. Gratis chilcano (solo valido en Lima)", price: 15.90, image: "/PCTigre.png", available: false, category: "3" },
        
        // Sopas Power (category: "4")
        { id: "sp1", name: "Combo Chilcano", description: "Sopa Chilcano + mini bowl arrocero a elegir + Chicha 9 oz + shot leche de tigre. Imagenes Referenciales", price: 21.9, image: "/ComboChilcano.png", available: true, category: "4" },
        { id: "sp2", name: "Combo Sudado", description: "Sopa Sudado de pescado + 1 mini bowl arrocero a elegir + 1 Chicha 9 oz + Shot leche de tigre. Imagenes referenciales", price: 24.9, image: "/ComboSudado.png", available: true, category: "4" },
        { id: "sp3", name: "Combo Chupe", description: "Sopa Chupe de pescado + 1 mini bowl arrocero a elegir + 1 Chicha 9 oz + shot de leche de tigre. Imagenes Referenciales", price: 26.9, image: "/ComboChupe.png", available: true, category: "4" },
        
        // Bowls Del Tigre (category: "5")
        { id: "bdt1", name: "Bowl Arrocero Langostinos", description: "Bowl de arroz chaufa con mariscos y langostinos + Chicharron de Pescado.", price: 21.9, image: "/BAL.png", available: true, category: "5" },
        { id: "bdt2", name: "Bowl Arrocero Clasico", description: "Bowl de arroz chaufa con mariscos + Chicharron de Pescado y Pota.", price: 17.9, image: "/BAC.png", available: true, category: "5" },
        { id: "bdt3", name: "Bowl del tigre Clasico", description: "Bowl 24 oz de arroz chaufa con mariscos + Chicharron de Pota + Leche de tigre de pota regular. Imagenes referenciales.", price: 23.99, image: "/BdtC.png", available: true, category: "5" },
        { id: "bdt4", name: "Bowl Arroz Chaufa con Mariscos", description: "Arroz Chaufa con Mariscos de 24 Oz. Imagen referencial.", price: 19.9, image: "/BALCM.png", available: true, category: "5" },
        { id: "bdt5", name: "Bowl Arrocero Pescado", description: "Bowl de arroz chaufa con mariscos + Chicharron de Pescado.", price: 19.9, image: "/BAP.png", available: true, category: "5" },
        { id: "bdt6", name: "Bowl del tigre Pescado", description: "Bowl 24 oz de arroz chaufa con mariscos + Chicharron de pescado + Leche de tigre de pota regular.", price: 25.9, image: "/BdtP.png", available: true, category: "5" },
        { id: "bdt7", name: "Bowl del tigre Langostinos", description: "Bowl 24 oz de arroz chaufa con mariscos + Chicharron de Langostinos + Leche de tigre de pescado", price: 27.9, image: "/BdtL.png", available: true, category: "5" },
        { id: "bdt8", name: "Bowl Arroz con Mariscos", description: "Arroz con Mariscos 24 Oz. Imagen referencial.", price: 21.9, image: "/BALAMM.png", available: true, category: "5" },

        // Leche de Tigre (category: "6")
        { id: "ldt1", name: "Leche de Tigre Pescado", description: "Leche de Tigre con trozos de Pescado + Chicharron pota. Elige entre Regular o Extremo. Imagenes referenciales.", price: 15.9, image: "/LdTP.png", available: true, category: "6" },
        { id: "ldt2", name: "Leche de Tigre Langostino", description: "Leche de Tigre con Langostinos + Piqueo de chicharron de pota. Elige el tamaño que prefieras. Imagenes referenciales.", price: 18.9, image: "/LdTL.png", available: true, category: "6" },
        { id: "ldt3", name: "Leche de Tigre Mixto", description: "Leche de Tigre con trozos de Pota, Pescado y Langostinos + Piqueo de chicharron de pota. Elige el tamaño que prefieras. Imagenes referenciales.", price: 17.9, image: "/LdTM.png", available: true, category: "6" },
        { id: "ldt4", name: "Leche de Tigre Clasico", description: "Leche de Tigre con trozos de pota + Piqueo de chicharron de pota. Elige el tamaño que prefieras. Imagenes referenciales.", price: 14.9, image: "/LdTC.png", available: true, category: "6" },

        // Ceviches (category: "7")
        { id: "cev1", name: "Causa Acevichada", description: "Causa de papa amarilla rellena con trozos de pota y tartara, bañada con ceviche de pescado", price: 19.9, image: "/CausaAcevichada.png", available: true, category: "7" },
        { id: "cev2", name: "Ceviche Pescado + Inca Kola + Chilcano Gratis", description: "Ceviche de Pescado. Elige entre Regular o Extremo. Incluye bebida Inca Kola 300ml y 1 chilcano gratis. Imagenes referenciales.", price: 24.9, image: "/CevichePescado1.png", available: true, category: "7" },
        { id: "cev3", name: "Ceviche Mixto + Inca Kola + Chilcano Gratis", description: "Ceviche de pota + Pescado + Langostinos. Elige entre Regular o Extremo. Incluye bebida Inca Kola 300ml y 1 chilcano gratis. Imagenes referenciales.", price: 27.9, image: "/CevichePescado2.png", available: true, category: "7" },
        
        // Fritazo (category: "8")
        { id: "fr1", name: "Fritazo Marino", description: "Milanesa de pescado + Arroz blanco + Yuquitas+ Sarza criolla + Chilcano", price: 18.9, image: "/FM.png", available: true, category: "8" },
        { id: "fr2", name: "Fritazo Milanesa", description: "Milanesa de pescado + papas fritas + Arroz blanco + Sarza criolla + Chilcano", price: 16.9, image: "/FritazodeMilanesa.png", available: true, category: "8" },
        { id: "fr3", name: "Fritazo Chaufa", description: "Milanesa de pescado + Arroz chaufa+ Papas fritas + Sarza criolla + Chilcano. Imagen referencial.", price: 23.9, image: "/FritazoChaufa.png", available: true, category: "8" },

        // Mostrimar (category: "9")
        { id: "mos1", name: "Mostrimar Teriyaki", description: "Chicharron de pescado teriyaki + Papas fritas + Chaufa de mariscos + chilcano", price: 20.9, image: "/MT.png", available: true, category: "9" },
        { id: "mos2", name: "Mostrimar Clasico", description: "Chicharron de pota + Papas fritas + Chaufa de mariscos + chilcano", price: 20.9, image: "/MC.png", available: true, category: "9" },
        { id: "mos3", name: "Mostrimar Royal", description: "Chicharron de pescado + Papas fritas + Chaufa de mariscos + Huevo frito + Chilcano", price: 22.9, image: "/MostrimarRoyal.png", available: true, category: "9" },
        
        // Box Marino (category: "10")
        { id: "bm1", name: "Puerto Box Power", description: "Chicharron de pescado + Papas fritas + Chilcano. Gratis salsa acevichada. Imagen referencial.", price: 18.9, image: "/PBP.png", available: true, category: "10" },
        { id: "bm2", name: "Combo del Tigre", description: "Leche de tigre pescado +Chicharron de Pota + Yuquitas fritas + Chifles + Canchita + Chilcano Gratis (Solo en Salon)", price: 21.9, image: "/CombodelTigre.png", available: true, category: "10" },
        { id: "bm3", name: "Puerto Box Super", description: "Chicharron de pescado + Papas fritas + Leche de tigre Pota regular + Chilcano. Gratis salsa acevichada. Imagen referencial.", price: 25.9, image: "/PBS.png", available: true, category: "10" },
        { id: "bm4", name: "Puerto Box Clasico", description: "Chicharron de pescado + Papas fritas. Gratis salsa acevichada. Imagen referencial.", price: 15.9, image: "/PBC.png", available: true, category: "10" },

        // Duos Marinos (category: "11")
        { id: "dm1", name: "Duo Clasico", description: "Ceviche de Pescado + Chicharron de Pota. Elige entre Regular o Extremo. Imagenes referenciales.", price: 23.9, image: "/DC.png", available: true, category: "11" },
        { id: "dm2", name: "Duo Arrocero Clasico", description: "Ceviche de pota y pescado + Arroz con mariscos. Elige entre Regular o Extremo. Imagenes referenciales.", price: 27.9, image: "/DAC.png", available: true, category: "11" },
        { id: "dm3", name: "Duo Arrocero Pescado", description: "Ceviche de Pescado + Arroz con mariscos. Elige entre Regular o Extremo. Imagenes referenciales.", price: 26.9, image: "/DAP.png", available: true, category: "11" },
        { id: "dm4", name: "Duo Arrocero Mixto", description: "Ceviche Mixto + Arroz con mariscos. Elige entre Regular o Extremo. Imagenes referenciales.", price: 27.9, image: "/DAM.png", available: true, category: "11" },
        { id: "dm5", name: "Duo Langostinos", description: "Ceviche de Pescado + Chicharron de Langostinos. Elige entre Regular o Extremo. Imagenes referenciales.", price: 28.9, image: "/DL.png", available: true, category: "11" },
        { id: "dm6", name: "Duo Mixto", description: "Ceviche de Pescado + Chicharron Mixto. Elige entre Regular o Extremo. Imagenes referenciales.", price: 27.9, image: "/DM.png", available: true, category: "11" },
        { id: "dm7", name: "Duo Pescado", description: "Ceviche de Pescado + Chicharron de Pescado. Elige entre Regular o Extremo. Imagenes referenciales.", price: 25.9, image: "/DP.png", available: true, category: "11" },
        { id: "dm8", name: "Duo Causa Pescado", description: "Causa de papa amarilla rellena con trozos de pota y tartara + Ceviche de pescado. Imagen referencial.", price: 30.9, image: "/DCP.png", available: true, category: "11" },
        
        // Trios Marinos (category: "12")
        { id: "tm1", name: "Trio Mixto + 1 chilcano gratis", description: "Ceviche de Pescado + Arroz con Mariscos o Chaufa con Mariscos + Chicharron Mixto + 1 chilcano Gratis (Solo Salon). Elige Regular o Extremo. Imagenes referenciales.", price: 30.9, image: "/TM1cg.png", available: true, category: "12" },
        { id: "tm2", name: "Trio Clasico + 1 chilcano gratis", description: "Ceviche de Pescado + Arroz con Mariscos o Chaufa con Mariscos + Chicharron de Pota + 1 chilcano Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 25.9, image: "/TC1cg.png", available: true, category: "12" },
        { id: "tm3", name: "Trio Langostinos + 1 chilcano gratis", description: "Ceviche de Pescado + Arroz con Mariscos o Chaufa con Mariscos + Chicharron de Langostinos + 1 chilcano Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 32.9, image: "/TL1cg.png", available: true, category: "12" },
        { id: "tm4", name: "Trio Pescado + 1 chilcano gratis", description: "Ceviche de Pescado + Arroz con Mariscos o Chaufa con Mariscos + Chicharron de Pescado + 1 chilcano Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 27.9, image: "/TP1cg.png", available: true, category: "12" },

        // Dobles (category: "13")
        { id: "d1", name: "Doble Vaso Extremo", description: "2 Leche de tigre con trozos de pota + 2 chicharrones clasico regular (pota) + 2 chichas. Imagenes referenciales.", price: 39.9, image: "/DVE.png", available: true, category: "13" },
        { id: "d2", name: "Doble Vaso Regular", description: "2 Leche de tigre con trozos de pota + 2 chicharrones clasico (pota) regular + 2 chichas. Imagenes referenciales.", price: 32.9, image: "/DVR.png", available: true, category: "13" },
        { id: "d3", name: "Doble Trio Pescado", description: "2 Trios Pescado (Ceviche de pescado + arroz con mariscos + chicharron de pescado) + 2 chichas + 2 Chilcanos Gratis (Solo Salon) Elige entre regular o extrema. Imagenes referenciales.", price: 59.9, image: "/DTP.png", available: true, category: "13" },
        { id: "d4", name: "Doble Trio Clasico", description: "2 Trios Clasico (Ceviche de pescado + arroz con mariscos + chicharron de pota) + 2 chichas + 2 Chilcano Gratis (Solo Salon). Elige entre regular o extremo. Imagenes referenciales.", price: 57.9, image: "/DTC.png", available: true, category: "13" },
        { id: "d5", name: "Doble Duo Pescado", description: "2 Duos Pescado (ceviche de pescado + chicharron de pescado) + 2 Chichas 12 Oz + 2 Chilcanos Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 52.9, image: "/DDP.png", available: true, category: "13" },
        { id: "d6", name: "Doble Duo Mixto", description: "2 Duos Mixto (ceviche de pescado+ chicharron mixto) + 2 Chichas de 12Oz + 2 Chilcanos Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 54.9, image: "/DDM.png", available: true, category: "13" },
        { id: "d7", name: "Doble Duo Clasico", description: "2 Duos Clasico (ceviche de pescado + chicharron de pota) + 2 Chichas de 12Oz + 2 Chilcanos Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 50.9, image: "/DDC.png", available: true, category: "13" },
        { id: "d8", name: "Doble Trio Mixto", description: "2 Trios Mixto (Ceviche de pescado, arroz con mariscos + chicharron mixto)+ 2 chichas + 2 Chilcanos Gratis (Solo Salon). Elige entre Regular o Extremo. Imagenes referenciales.", price: 61.9, image: "/DTM.png", available: true, category: "13" },

        // Rondas Marinas (category: "14")
        { id: "rm1", name: "Ronda del Tigre Inka Kola", description: "Ceviche de Pescado + Chicharron Clasico + Chicharron de Pescado + Chaufa de Mariscos + Leche de tigre mixta + 2 inka kolas 300 ml + 2 chilcanos GRATIS (solo salon) Imagenes referenciales.", price: 59.9, image: "/RdTIK.png", available: true, category: "14" },
        { id: "rm2", name: "Ronda Mixta + Chilcanos", description: "Ronda Marina Mixta: Arroz chaufa de mariscos + Arroz con mariscos + ceviche de pescado + chicharron + causa rellena con trozos de pota y tartara. Gratis Chilcanos gratis", price: 51.9, image: "/RMmC.png", available: true, category: "14" },
        { id: "rm3", name: "Ronda Mixta Inka Kola", description: "Ceviche de pescado + Chicharron de Pescado + Arroz con Mariscos + Chaufa de Mariscos + Causa rellena con trozos de pota y tartara + 2 inka kolas 300 ml + 2 chilcanos GRATIS (solo salon).", price: 59.9, image: "/RMIK.png", available: true, category: "14" },
        { id: "rm4", name: "Ronda del Tigre Chicha", description: "Ceviche de Pescado + Chicharron de Clasico + Chicharron de Pescado + Chaufa de Mariscos + Leche de tigre mixta + 2 chichas + 2 chilcanos GRATIS (solo salon) Imagenes referenciales.", price: 59.9, image: "/RdTC.png", available: true, category: "14" },
        { id: "rm5", name: "Ronda Mixta Chicha", description: "Ceviche de pescado + Chicharron de Pescado + Arroz con Mariscos + Chaufa de Mariscos + Causa rellena con trozos de pota y tartara + 2 chichas. Imagenes referenciales.", price: 59.9, image: "/RMC.png", available: true, category: "14" },

        // Mega Marino (category: "15")
        { id: "mm1", name: "Mega Marino Super", description: "Chicharron de pescado + Pota + Langostinos + Chaufa de Mariscos + Papas fritas + Leche de tigre de pescado 9 Oz + 2 chilcanos. Imagen referencial.", price: 49.9, image: "/MMS.png", available: true, category: "15" },
        { id: "mm2", name: "Mega Marino Power", description: "Chicharron de pescado, pota y langostinos + Chaufa de mariscos + Papas fritas + 2 chilcanos. Incluye nuestra salsa acevichada. Imagen referencial.", price: 42.9, image: "/MMP.png", available: true, category: "15" },
        { id: "mm3", name: "Mega Marino Clasico", description: "Chicharron de pescado + Chicharron de langostinos + Chaufa de mariscos + Papas fritas + Yuquitas fritas. Imagenes referenciales", price: 34.9, image: "/MMC.png", available: true, category: "15" },

        // Familiares (category: "16")
        { id: "fam1", name: "Familiar Tradicional (3 personas)", description: "Incluye: 1 trio clasico + 1 duo clasico + 1 ceviche de pescado + 3 chichas 12 oz. Imagen referencial.", price: 99.9, image: "/FT3P.png", available: true, category: "16" },
        { id: "fam2", name: "Familiar Cevichero (4 personas)", description: "2 Ceviches clasicos + 1 Chicharron Pescado+ Arroz con mariscos + 2 porciones de yucas + 4 Chichas 12 Onz", price: 110.9, image: "/FC4P.png", available: true, category: "16" },
        { id: "fam3", name: "Familiar Marino (3 personas)", description: "Incluye: 1 trio clasico + 1 duo clasico + 1 bowl de arroz con mariscos + 3 chichas 12 oz. Imagen referencial.", price: 99.9, image: "/FM3P.png", available: true, category: "16" },
      ]
      setItems(mock) // Always load all mock items, filtering happens in the component
    }
  }

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedCategory) {
      filtered = items.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [items, selectedCategory, searchQuery]);


  const handleItemClick = (item: MenuItem) => {
    if (item.available === false) {
      setToastMessage("Producto agotado");
    } else {
      setSelectedItem(item)
      setIsModalOpen(true)
    }
  }

  const handleAddToCart = (item: any) => {
    addItem(item)
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const orderedCategoryNames = [
    "Mostrar todo",
    "Promos Fast",
    "Express",
    "Promociones",
    "Sopas Power",
    "Bowls Del Tigre",
    "Leche de Tigre",
    "Ceviches",
    "Fritazo",
    "Mostrimar",
    "Box Marino",
    "Dúos Marinos",
    "Tríos Marinos",
    "Dobles",
    "Rondas Marinas",
    "Mega Marino",
    "Familiares",
  ]

  const getCategoryIdByName = (name: string) => {
    const found = categories.find(c => c.name === name)
    return found?.id
  }

  const activeCategoryName = selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || "" : "Mostrar todo"

  // Two fixed rows: first 8 chips ("Mostrar todo" to "Ceviches"), then remaining 9
  const firstRow = orderedCategoryNames.slice(0, 8)
  const secondRow = orderedCategoryNames.slice(8)

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <CustomerHeader />

      {toastMessage && (
        <SimpleToast
          message={toastMessage}
          type="error"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Hero full-bleed edge-to-edge */}
      <section className="relative h-[300px] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <Image src="/somosceviche2.png" alt="Somos Ceviche" fill className="object-cover" priority />
      </section>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Title */}
        <div className="mt-10 mb-8 text-center">
          <h2 className="text-3xl font-display font-bold text-[#1000a3]">Explora nuestra carta</h2>
        </div>

        {/* Chips Section */}
        <section className="py-6 px-6 mb-0">
          <div className="flex flex-col gap-3">
            {/* Row 1: 8 chips */}
            <div className="flex flex-nowrap justify-center gap-3 max-w-[1200px] mx-auto overflow-x-auto md:overflow-visible">
              {firstRow.map((name) => {
              const isAll = name === "Mostrar todo"
              const id = isAll ? null : getCategoryIdByName(name)
              const isActive = isAll ? selectedCategory === null : selectedCategory === id
                return (
                  <div key={name} className={`relative overflow-visible inline-block ${isActive ? 'mx-5' : ''}`}>
                  {/* Favicon directly, positioned where the circle was */}
                  <Image
                    src="/favicon.ico"
                    alt="200 Millas"
                    width={48}
                    height={48}
                    priority
                    className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-20 transition-opacity duration-200 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />

                  <label
                    onClick={() => setSelectedCategory(id)}
                      className={`inline-flex items-center rounded-full cursor-pointer transition-all duration-200 ease-in-out text-base h-10 relative whitespace-nowrap ${
                        isActive
                          ? "bg-[#1000a3] text-white"
                          : "bg-[#e2e200] text-[#1000a3] hover:shadow-md"
                      } ${isActive ? 'pl-[25px] pr-4 py-2' : 'px-5 py-2'}`}
                    style={{ minWidth: isActive ? 111 : 99 }}
                  >
                    <span className="font-display font-bold leading-none">{name}</span>
                  </label>
                </div>
              )
              })}
            </div>

            {/* Row 2: 9 chips */}
            <div className="flex flex-nowrap justify-center gap-3 max-w-[1200px] mx-auto overflow-x-auto md:overflow-visible">
              {secondRow.map((name) => {
                const isAll = name === "Mostrar todo"
                const id = isAll ? null : getCategoryIdByName(name)
                const isActive = isAll ? selectedCategory === null : selectedCategory === id
                return (
                  <div key={name} className={`relative overflow-visible inline-block ${isActive ? 'mx-5' : ''}`}>
                    <Image
                      src="/favicon.ico"
                      alt="200 Millas"
                      width={48}
                      height={48}
                      priority
                      className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-20 transition-opacity duration-200 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />

                    <label
                      onClick={() => setSelectedCategory(id)}
                      className={`inline-flex items-center rounded-full cursor-pointer transition-all duration-200 ease-in-out text-base h-10 relative whitespace-nowrap ${
                        isActive
                          ? "bg-[#1000a3] text-white"
                          : "bg-[#e2e200] text-[#1000a3] hover:shadow-md"
                      } ${isActive ? 'pl-[25px] pr-4 py-2' : 'px-5 py-2'}`}
                      style={{ minWidth: isActive ? 111 : 99 }}
                    >
                      <span className="font-display font-bold leading-none">{name}</span>
                    </label>
                  </div>
                )
              })}
            </div>

            {/* Search (left-aligned under second row) */}
            <div className="my-8 w-full max-w-[280px] relative">
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por plato"
                className="w-full h-12 rounded-lg py-2 pl-5 pr-12 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                {searchQuery ? (
                  <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-gray-800 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          
        </section>

        {/* Loading Screen */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ease-out ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity duration-500 ease-out ${loading ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative flex items-center space-x-6 animate-[float_6s_ease-in-out_infinite]">
            <div className="relative">
              <div className="absolute -inset-6 opacity-25">
                <div className="w-40 h-40 rounded-full bg-[#1000a3] blur-3xl"></div>
              </div>
              <Image
                src="/favicon.ico"
                alt="200 Millas"
                width={96}
                height={96}
                className="relative"
                style={{
                  filter: 'none',
                  animation: 'pulse-scale-strong 1.6s ease-in-out infinite'
                }}
              />
            </div>
            <div className="flex items-baseline">
              <span className="text-[#1000a3] font-display font-bold text-5xl">Cargando</span>
              <span className="inline-flex space-x-1 ml-2">
                <span className="text-[#1000a3] font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite]">.</span>
                <span className="text-[#1000a3] font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite_0.2s]">.</span>
                <span className="text-[#1000a3] font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite_0.4s]">.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <section className="pb-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-64" />
              ))}
            </div>
          ) : (
            <>
              {selectedCategory === null ? (
                // "Mostrar todo" View: Grouped by category
                orderedCategoryNames.slice(1).map(categoryName => {
                  const categoryId = getCategoryIdByName(categoryName);
                  if (!categoryId) return null;
                  
                  const productsForCategory = filteredItems.filter(item => item.category === categoryId);
                  
                  if (productsForCategory.length === 0) return null;

                  return (
                    <div key={categoryId} className="mb-16">
                      <div className="mt-2 mb-8 text-center">
                        <h3 className="text-[#1000a3] font-display font-bold text-[20px]">{categoryName}</h3>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {productsForCategory.map((item) => (
                          <ProductCard key={item.id} menuItem={item} onSelect={() => handleItemClick(item)} />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Single Category View
                <>
                  <div className="mt-2 mb-8 text-center">
                    <h3 className="text-[#1000a3] font-display font-bold text-[20px]">{activeCategoryName}</h3>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => (
                      <ProductCard key={item.id} menuItem={item} onSelect={() => handleItemClick(item)} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </main>
      <CustomerFooter />

      {/* Product Options Modal */}
      {selectedItem && (
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onAddToCart={handleAddToCart}
          menuItem={selectedItem}
        />
      )}
    </div>
  )
}

