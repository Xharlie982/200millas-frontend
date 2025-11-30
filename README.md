<p align="center">
  <img src="public/logo-200millas.svg" alt="200 Millas" height="72" />
</p>

<h1 align="center">200 Millas · Frontend</h1>

<p align="center">
  Aplicación web de pedidos (Next.js 16 · TypeScript · Tailwind · shadcn/ui)
</p>

---

## Índice

- [Características](#características)
- [Stack y Arquitectura](#stack-y-arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Inicio Rápido](#inicio-rápido)
- [Páginas Disponibles](#páginas-disponibles)
- [Variables de Entorno](#variables-de-entorno)
- [Integración con Backend](#integración-con-backend)
- [Desarrollo](#desarrollo)
- [Deployment](#deployment)
- [Contribuir](#contribuir)

## Características

- Para clientes: explorar carta por categorías, búsqueda, pedidos, historial
- Para restaurante: panel, workflow, tiempos, métricas
- Multi-tenancy, real-time ready, responsive, serverless-ready

## Stack y Arquitectura

- Next.js 16, App Router, TypeScript estricto
- Tailwind CSS + shadcn/ui
- Context API (auth, cart) + Sonner (toasts)
- Preparado para AWS (API Gateway, Lambda, EventBridge) y Vercel

## Estructura del Proyecto

```
├── app/
│   ├── layout.tsx              # Fuentes, providers, Toaster
│   ├── page.tsx                # Homepage
│   ├── carta/                  # Carta de productos
│   ├── checkout/               # Checkout
│   ├── perfil/                 # Perfil y pedidos
│   ├── login/                  # Login/registro
│   └── globals.css             # Estilos globales
├── components/
│   ├── customer-header.tsx     # Header
│   ├── customer-footer.tsx     # Footer (redes sociales)
│   ├── product-card.tsx        # Tarjeta de producto
│   ├── product-options-modal.tsx
│   └── ...
├── lib/
│   ├── api.ts                  # Cliente API
│   ├── auth-context.tsx        # Auth
│   ├── cart-context.tsx        # Carrito
│   └── types.ts                # Tipos TS
└── public/                     # Assets (imágenes, svg)
```

## Inicio Rápido

1) Clonar e instalar

```bash
git clone <repository-url>
cd 200millas-frontend
npm install
```

2) Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TENANT_ID=200millas
NEXT_PUBLIC_AUTH_ENABLED=true
```

3) Ejecutar

```bash
npm run dev
# http://localhost:3000
```

---

## Secciones Principales de la Aplicación

A continuación se detallan las funcionalidades de las rutas más importantes para el cliente.

### `/` (Página de Inicio)

Es la página de bienvenida y el punto de entrada principal para los usuarios.

-   **Propósito:** Presentar la marca, mostrar promociones, productos destacados y dirigir a los usuarios a las secciones clave como la carta o la cobertura.
-   **Componentes Clave:** Banners promocionales, accesos directos a la carta, propuesta de valor del restaurante.

### `/carta` (La Carta)

El corazón de la aplicación. Aquí los clientes exploran y seleccionan los productos que desean pedir.

-   **Propósito:** Mostrar de forma organizada todos los productos disponibles para la venta.
-   **Funcionalidades:**
    -   **Navegación por Categorías:** Permite filtrar los productos (Ceviches, Entradas, Bebidas, etc.).
    -   **Tarjetas de Producto (`ProductCard`):** Cada producto tiene su propia tarjeta con imagen, nombre, descripción y precio.
    -   **Añadir al Carrito:** Los usuarios pueden añadir productos directamente al carrito. Para productos con opciones (ej. "sin ají"), se abre un modal de personalización.
    -   **Pantalla de Carga:** Muestra un indicador de carga mientras se obtienen los productos desde el backend.

### `/cobertura` (Zona de Reparto)

Una herramienta esencial para que el usuario verifique si su domicilio se encuentra dentro del área de delivery.

-   **Propósito:** Evitar que los usuarios llenen un carrito para luego descubrir que no se puede entregar en su zona.
-   **Funcionalidades:**
    -   **Mapa Interactivo:** Muestra polígonos que delimitan las zonas de reparto.
    -   **Buscador de Direcciones:** Integrado con Google Places para autocompletar y buscar direcciones.
    -   **Validación Visual:** Un marcador en el mapa indica si la dirección buscada está dentro o fuera de la zona de cobertura.

### `/perfil` (Perfil de Usuario)

Sección privada para usuarios autenticados donde pueden gestionar su información personal, pedidos y configuración.

-   **Propósito:** Centralizar toda la información y acciones relacionadas con la cuenta del usuario.
-   **Sub-secciones:**
    -   `/mis-datos`: Editar información básica como nombre, DNI, fecha de nacimiento y pronombre. También permite eliminar la cuenta.
    -   `/contraseña`: Cambiar la contraseña de acceso.
    -   `/direcciones`: Administrar direcciones de envío guardadas.
    -   `/mis-pedidos`: Consultar el historial de pedidos realizados.
    -   `/configuración`: Gestionar preferencias y otros ajustes de la cuenta.
-   **Componentes Clave:** `ProfileSidebar` para la navegación interna y visualización de datos básicos, y formularios para la edición de datos.

### `/perfil/beneficios` (Beneficios y Puntos)

Página dedicada al programa de lealtad, donde los usuarios pueden ver las ventajas de ser un cliente frecuente.

-   **Propósito:** Incentivar la recurrencia de compra y premiar la fidelidad del cliente.
-   **Funcionalidades:**
    -   Visualización de puntos acumulados.
    -   Listado de ofertas exclusivas y recompensas disponibles.
    -   Información sobre cómo ganar más puntos.

---

## Páginas Disponibles

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/` | Inicio | No |
| `/carta` | Catálogo completo | No |
| `/checkout` | Checkout | Sí |
| `/perfil` | Perfil y pedidos | Sí |
| `/login` | Login/registro | No |

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:3001/api` |
| `NEXT_PUBLIC_TENANT_ID` | ID del tenant | `200millas` |
| `NEXT_PUBLIC_AUTH_ENABLED` | Habilitar auth | `true` |

## Integración con Backend

El frontend espera que el backend exponga los siguientes endpoints. Todas las rutas protegidas requieren un header `Authorization: Bearer <token>`.

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Payload (Body) | Respuesta Exitosa (200) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Autentica a un usuario. | `{ "email": "...", "password": "..." }` | `{ "token": "...", "user": { ... } }` |
| `POST` | `/logout`| Invalida el token de sesión del usuario. | (Ninguno) | `{ "success": true }` |

### Perfil de Usuario (`/api/users`)

| Método | Ruta | Descripción | Payload (Body) | Respuesta Exitosa (200) |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | `/me` | Actualiza los datos del usuario autenticado. | `{ "firstName": "...", "dni": "..." }` | `{ "user": { ... } }` |
| `DELETE`| `/me` | Elimina la cuenta del usuario autenticado. | (Ninguno) | `{ "success": true }` |

### Pedidos (`/api/orders`)

| Método | Ruta | Descripción | Payload (Body) | Respuesta Exitosa (200/201) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Crea un nuevo pedido. | `{ "items": [...], "total": ... }` | `{ "order": { ... } }` |
| `GET` | `/` | Obtiene el historial de pedidos del usuario. | (Ninguno) | `[{ "order": ... }, ...]` |
| `GET` | `/:id`| Obtiene los detalles de un pedido específico. | (Ninguno) | `{ "order": { ... } }` |
| `PATCH`| `/:id/status`| Actualiza el estado de un pedido. | `{ "status": "en-camino" }` | `{ "order": { ... } }` |

### Menú / Carta (`/api/menu`)

| Método | Ruta | Descripción | Query Params | Respuesta Exitosa (200) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Obtiene todas las categorías de productos. | (Ninguno) | `[{ "category": ... }, ...]` |
| `GET` | `/items` | Obtiene los productos, opcionalmente filtrados. | `?category=ceviches` | `[{ "item": ... }, ...]` |

---

## Desarrollo

- Estilos con Tailwind v4 (utility-first)
- Componentes shadcn/ui
- Tipos en `lib/types.ts`

## Deployment

- Guía completa en `DEPLOYMENT.md`
- Recomendado: Vercel (preview + prod)

## Contribuir

1. Crea rama: `git checkout -b feat/mifeature`
2. Commits: `git commit -m "feat: mi feature"`
3. Push: `git push origin feat/mifeature`
4. PR: abre un Pull Request

---

Proyecto académico · Cloud Computing (CS2032)
