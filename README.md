# 200 Millas - Sistema de Gestión de Pedidos

Aplicación web completa para gestión de pedidos de comida marina rápida, desarrollada con Next.js 16 y diseñada para integrar con arquitectura serverless en AWS.

## Características

### Para Clientes
- Explorar menú de productos por categorías
- Realizar pedidos en línea
- Seguimiento en tiempo real del estado del pedido
- Historial de pedidos

### Para Restaurante
- Panel de gestión de pedidos
- Workflow de preparación (cocinero → empacador → repartidor)
- Seguimiento de tiempos de cada etapa
- Dashboard con métricas de desempeño

### Arquitectura
- **Multi-tenancy**: Soporte para múltiples restaurantes
- **Serverless-ready**: Preparado para AWS Lambda, API Gateway, EventBridge
- **Real-time**: Actualizaciones automáticas de estado
- **Responsive**: Funciona en desktop, tablet y móvil

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── page.tsx                 # Página de inicio
│   ├── cliente/                 # Interfaz para clientes
│   ├── restaurante/             # Panel del restaurante
│   ├── pedidos/                 # Seguimiento de pedidos
│   ├── dashboard/               # Métricas y resumen
│   ├── carta/                   # Catálogo de productos
│   ├── cobertura/               # Ubicaciones y horarios
│   ├── layout.tsx               # Layout principal con AuthProvider
│   └── globals.css              # Estilos globales
├── components/
│   ├── header.tsx               # Navegación principal
│   ├── footer.tsx               # Pie de página
│   ├── login-modal.tsx          # Modal de autenticación
│   ├── user-menu.tsx            # Menú de usuario
│   ├── protected-route.tsx      # Componente para rutas protegidas
│   ├── cart-sidebar.tsx         # Carrito de compras
│   ├── menu-item-card.tsx       # Tarjeta de producto
│   ├── order-card.tsx           # Tarjeta de pedido
│   └── workflow-timeline.tsx    # Timeline del workflow
├── lib/
│   ├── api.ts                   # Cliente API
│   ├── types.ts                 # Tipos TypeScript
│   └── auth-context.tsx         # Contexto de autenticación
└── public/                      # Archivos estáticos
\`\`\`

## Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd 200millas
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edita `.env.local` con tu configuración:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TENANT_ID=200millas
\`\`\`

4. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Páginas Disponibles

| Ruta | Descripción | Autenticación |
|------|-------------|---------------|
| `/` | Inicio y menú público | No |
| `/cliente` | Hacer pedidos | No |
| `/carta` | Catálogo completo | No |
| `/cobertura` | Ubicaciones y horarios | No |
| `/pedidos` | Mis pedidos | Sí |
| `/restaurante` | Panel de gestión | Sí (cook/dispatcher/driver) |
| `/dashboard` | Métricas y resumen | Sí (admin) |

## Integración con Backend

### Endpoints Requeridos

Tu backend debe implementar los siguientes endpoints:

#### Autenticación
\`\`\`
POST /api/auth/login
POST /api/auth/logout
\`\`\`

#### Órdenes
\`\`\`
POST /api/orders
GET /api/orders
GET /api/orders/{id}
PATCH /api/orders/{id}/status
\`\`\`

#### Menú
\`\`\`
GET /api/menu/categories
GET /api/menu/items
\`\`\`

#### Workflow
\`\`\`
GET /api/workflow/{orderId}/steps
PATCH /api/workflow/{orderId}/steps/{stepId}
\`\`\`

#### Dashboard
\`\`\`
GET /api/dashboard/summary
GET /api/dashboard/metrics
\`\`\`

Ver `API_INTEGRATION.md` para más detalles.

## Roles de Usuario

- **customer**: Cliente que realiza pedidos
- **cook**: Cocinero que prepara la comida
- **dispatcher**: Empacador que prepara el envío
- **driver**: Repartidor que entrega los pedidos
- **admin**: Administrador con acceso a dashboard

## Autenticación Multi-tenancy

El sistema soporta múltiples tenants (restaurantes). Cada tenant:

1. Tiene su propio `TENANT_ID`
2. Sus datos están aislados en la base de datos
3. Los usuarios pertenecen a un tenant específico

Implementa Row Level Security (RLS) en tu base de datos para garantizar el aislamiento de datos.

## Desarrollo

### Agregar Nueva Página

1. Crea un archivo en `app/nueva-pagina/page.tsx`
2. Importa componentes necesarios
3. Si requiere autenticación, envuelve con `<ProtectedRoute>`

### Agregar Nuevo Endpoint API

1. Agrega el método en `lib/api.ts`
2. Define los tipos en `lib/types.ts`
3. Usa el cliente en tus componentes

### Estilos

El proyecto usa Tailwind CSS v4. Los estilos se definen directamente en las clases de los elementos.

## Deployment

### Vercel (Recomendado)

\`\`\`bash
npm run build
vercel deploy
\`\`\`

### AWS Amplify

\`\`\`bash
amplify init
amplify publish
\`\`\`

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:3001/api` |
| `NEXT_PUBLIC_TENANT_ID` | ID del tenant | `200millas` |
| `NEXT_PUBLIC_AUTH_ENABLED` | Habilitar autenticación | `true` |
| `NEXT_PUBLIC_ENABLE_DELIVERY_TRACKING` | Seguimiento de entregas | `true` |

## Troubleshooting

### Error: "API not responding"
- Verifica que `NEXT_PUBLIC_API_URL` sea correcto
- Asegúrate de que tu backend esté corriendo
- Revisa la consola del navegador para más detalles

### Error: "User not authenticated"
- Limpia el localStorage: `localStorage.clear()`
- Intenta login nuevamente
- Verifica que el endpoint `/api/auth/login` funcione

### Estilos no se aplican
- Ejecuta `npm run dev` nuevamente
- Limpia el cache del navegador (Ctrl+Shift+Delete)
- Verifica que Tailwind CSS esté configurado correctamente

## Contribuir

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -am 'Agrega nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

## Licencia

Proyecto académico - Cloud Computing (CS2032)

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
