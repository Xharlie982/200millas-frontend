"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import CausaImg from "@/public/Causa200millas.png"

export default function LoginPage() {
  const router = useRouter()
  const { login, setUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockUser = {
          id: "1",
          name: "Carlos Alith",
          email: email,
          role: "customer",
          tenantId: "200millas"
      }
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      
      toast.success("¡Bienvenido de nuevo!")
      router.push("/")
    } catch (error) {
      toast.error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.")
      setShowRegister(false)
      setEmail("")
      setPassword("")
      setName("")
      setConfirmPassword("")
    } catch (error) {
      toast.error("Error al crear cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
        if (auth && googleProvider) {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user
            
            const appUser = {
                id: user.uid,
                name: user.displayName || "Usuario Google",
                email: user.email || "",
                role: "customer",
                tenantId: "200millas",
                photoUrl: user.photoURL || undefined
            }
            
            setUser(appUser)
            localStorage.setItem("user", JSON.stringify(appUser))
            toast.success(`Bienvenido, ${user.displayName || "Usuario"}`)
            router.push("/")
        } else {
            console.warn("Firebase keys missing. Using simulation.")
            await new Promise((resolve) => setTimeout(resolve, 1500))
            const appUser = {
                id: "google-sim",
                name: "Usuario Google (Simulado)",
                email: "demo@gmail.com",
                role: "customer",
                tenantId: "200millas"
            }
            setUser(appUser)
            localStorage.setItem("user", JSON.stringify(appUser))
            toast.success("Conectado con Google (Simulación)")
            router.push("/")
        }
    } catch (error: any) {
        console.error("Google login error:", error)
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            toast.info("Inicio de sesión cancelado")
        } else {
            toast.error("Error al conectar con Google.")
        }
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#1000a3]">
      {/* Fondo Marino con Degradados y Olas Originales (Pre-Amaru) */}
      <div className="absolute inset-0 w-full h-full z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-[#1000a3] to-[#060040]"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>

         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg className="relative block w-full h-[300px] md:h-[400px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#0060b0" fillOpacity="0.3" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg className="absolute bottom-0 w-full h-[250px] md:h-[350px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#0080d0" fillOpacity="0.4" d="M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,149.3C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg className="absolute bottom-0 w-full h-[180px] md:h-[220px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#4facfe" fillOpacity="0.6" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
             <svg className="absolute bottom-0 w-full h-[160px] md:h-[200px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#ffffff" fillOpacity="0.2" d="M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,160C672,171,768,213,864,224C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
         </div>
      </div>
      
      <div className="relative z-10 w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-white relative order-2 md:order-1">
           
           <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-[#1000a3] mb-2">
                {showRegister ? "Crear Cuenta" : "Iniciar Sesión"}
              </h2>
              <p className="text-gray-400 text-sm">
                {showRegister ? "Registra tus datos" : "en tu cuenta"}
              </p>
           </div>

           {!showRegister ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    className="h-12 rounded-full bg-gray-50 border-gray-200 px-6 focus:bg-white focus:border-[#1000a3] focus:ring-1 focus:ring-[#1000a3] transition-all text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    className="h-12 rounded-full bg-gray-50 border-gray-200 px-6 focus:bg-white focus:border-[#1000a3] focus:ring-1 focus:ring-[#1000a3] transition-all text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all uppercase tracking-wide transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {isLoading ? "Cargando..." : "Ingresar"}
                </Button>
                
                <div className="text-center pt-2">
                    <Link href="#" className="text-gray-400 text-sm hover:text-[#1000a3] transition-colors decoration-dotted underline underline-offset-4">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                    required
                    className="h-12 rounded-full bg-gray-50 border-gray-200 px-6 focus:bg-white focus:border-[#1000a3] focus:ring-1 focus:ring-[#1000a3] transition-all text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    className="h-12 rounded-full bg-gray-50 border-gray-200 px-6 focus:bg-white focus:border-[#1000a3] focus:ring-1 focus:ring-[#1000a3] transition-all text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    className="h-12 rounded-full bg-gray-50 border-gray-200 px-6 focus:bg-white focus:border-[#1000a3] focus:ring-1 focus:ring-[#1000a3] transition-all text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar contraseña"
                    required
                    className="h-12 rounded-full bg-gray-50 border-gray-200 px-6 focus:bg-white focus:border-[#1000a3] focus:ring-1 focus:ring-[#1000a3] transition-all text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all uppercase tracking-wide transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {isLoading ? "Creando..." : "Registrarse"}
                </Button>
              </form>
            )}
        </div>

        {/* Right Side - Social / Image */}
        <div className="w-full md:w-1/2 relative flex flex-col justify-center items-center p-10 text-white order-1 md:order-2 overflow-hidden">
           {/* Background Image */}
           <div className="absolute inset-0 z-0">
              <Image 
                src={CausaImg}
                alt="Causa 200 Millas"
                fill
                className="object-cover scale-110"
                placeholder="blur"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1000a3]/90 to-[#1000a3]/40 backdrop-blur-[2px]"></div>
           </div>
           
           <div className="relative z-10 flex flex-col items-center text-center justify-center h-full">
              <h2 className="text-3xl font-bold mb-2">
                {showRegister ? "Regístrate" : "Inicia Sesión"}
              </h2>
              <p className="text-white/90 mb-10 font-medium">
                con tu cuenta de Google
              </p>
              
              <button 
                onClick={handleGoogleLogin}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl group cursor-pointer mb-12"
                title="Continuar con Google"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>

              <div className="mt-auto md:mt-0 text-sm flex flex-col items-center w-full">
                 <p className="mb-3 text-white/90 font-medium">
                    {showRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
                 </p>
                 <button 
                    onClick={() => setShowRegister(!showRegister)}
                    className="text-white font-bold tracking-widest text-xs border-2 border-white/30 px-8 py-3 rounded-full hover:bg-white/20 transition-all cursor-pointer uppercase mb-12"
                 >
                    {showRegister ? "Iniciar Sesión" : "Registrarse"}
                 </button>

                 {/* Logo moved here - bottom center, bigger and lower */}
                 <div className="mt-auto pt-8 pb-2">
                    <Link href="/" className="hover:scale-105 transition-transform cursor-pointer" title="Volver al inicio">
                        <Image 
                            src="/logo-200millas.svg" 
                            alt="200 Millas" 
                            width={240} 
                            height={80} 
                            className="h-16 w-auto drop-shadow-xl opacity-95 hover:opacity-100"
                        />
                    </Link>
                 </div>
              </div>
           </div>
        </div>

        {/* "OR" Badge */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg text-gray-400 text-sm border border-gray-100 font-sans italic">
           o
        </div>
        
      </div>
    </div>
  )
}
