import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuración proporcionada por el usuario
// NOTA: En producción, estos valores deberían estar en variables de entorno (.env)
const firebaseConfig = {
  apiKey: "AIzaSyCzO8epYYlQUOyR3_uenTIV8_7Qg2Ed7a4",
  authDomain: "millas-4b135.firebaseapp.com",
  projectId: "millas-4b135",
  storageBucket: "millas-4b135.firebasestorage.app",
  messagingSenderId: "819786173000",
  appId: "1:819786173000:web:f1e943a0bb5d7a43b0267d",
  measurementId: "G-0BRXL6TLG9"
};

let auth: Auth;
let googleProvider: GoogleAuthProvider;
let analytics;

// Inicializar Firebase solo si no existe ya una instancia
if (!getApps().length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Analytics solo funciona en el cliente (navegador)
  if (typeof window !== 'undefined') {
    isSupported().then(yes => yes && (analytics = getAnalytics(app)));
  }
} else {
  const app = getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider, analytics };
