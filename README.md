# Rappi Entregas - Angular Frontend

Frontend completo para una plataforma web de gestión de domicilios realizados en motocicleta. La aplicación facilita la interacción entre restaurantes, clientes, repartidores y operadores logísticos a través de una interfaz moderna, responsiva y accesible.

## 🚀 Características Implementadas

### ✅ Autenticación OAuth
- Login con Google
- Login con Microsoft
- Login con GitHub
- Autenticación Email/Password
- Interceptor HTTP para agregar token de autorización automáticamente
- Guardián de rutas para proteger páginas

### ✅ Operaciones CRUD Completas
- **Restaurantes**: Gestión completa de restaurantes
- **Productos**: CRUD de productos alimenticios
- **Menús**: Asociación de productos con restaurantes
- **Órdenes**: Gestión de pedidos con asignación a motocicletas
- **Direcciones**: Gestión de direcciones de entrega
- **Motocicletas**: CRUD de motocicletas con seguimiento de ubicación
- **Conductores**: Gestión de conductores
- **Turnos**: Asignación de conductores a motocicletas
- **Inconvenientes**: Registro de problemas con motocicletas
- **Clientes**: Gestión de usuarios del sistema
- **Fotos**: Gestión de fotografías de evidencias

### ✅ Gráficos e Informes Visuales
- 3 gráficos circulares (distribución de pedidos, motos y conductores)
- 3 gráficos de barras (pedidos por restaurante, ingresos mensuales, pedidos por día)
- 3 gráficos de series temporales (pedidos, conductores activos, motos en uso)
- Servidor mock para datos de gráficos (puerto 3001)
- Integración con Chart.js y ng2-charts

### ✅ Mapa Interactivo
- Visualización en tiempo real de la ubicación de motocicletas
- Integración con Google Maps
- Actualización automática cada 5 segundos
- Marcadores personalizados para motocicletas

### ✅ Notificaciones
- Notificaciones visuales para nuevos pedidos asignados
- Alertas sonoras llamativas
- Sistema de notificaciones configurable
- Integración con el servicio de órdenes

### ✅ Chatbot Inteligente
- Integración con API de Gemini (Google)
- Respuestas a preguntas frecuentes
- Interfaz de chat moderna
- Configuración de API Key

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Backend API corriendo en `http://localhost:5000`
- API Key de Google Gemini (para el chatbot)
- API Key de Google Maps (para el mapa)

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar Firebase:**
   - El archivo `src/app/config/firebase.config.ts` ya contiene la configuración.
   - Si necesitas cambiar las credenciales, edita este archivo.

3. **Configurar API Keys:**
   - **Google Gemini**: Configura la API Key desde la interfaz del chatbot o en `localStorage` con la clave `gemini_api_key`
   - **Google Maps**: Actualiza `YOUR_GOOGLE_MAPS_API_KEY` en `src/app/components/map/moto-map.component.ts`

4. **Iniciar servidor mock para gráficos (opcional):**
```bash
npm run mock-server
```
El servidor mock estará disponible en `http://localhost:3001`

5. **Ejecutar el servidor de desarrollo:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── navbar/         # Barra de navegación
│   │   ├── photos/         # Componentes de fotos
│   │   └── map/            # Componente de mapa interactivo
│   ├── pages/              # Páginas principales
│   │   ├── login/          # Página de login
│   │   ├── restaurant/     # CRUD de restaurantes
│   │   ├── productos/      # CRUD de productos
│   │   ├── menu/           # CRUD de menús
│   │   ├── orders/         # CRUD de órdenes
│   │   ├── address/        # CRUD de direcciones
│   │   ├── motorcycle/     # CRUD de motocicletas
│   │   ├── driver/         # CRUD de conductores
│   │   ├── shifts/         # CRUD de turnos
│   │   ├── issue/          # CRUD de inconvenientes
│   │   ├── customer/       # CRUD de clientes
│   │   ├── photos/         # CRUD de fotos
│   │   ├── graficos/       # Página de gráficos
│   │   └── chatbot/        # Chatbot con Gemini
│   ├── services/           # Servicios Angular
│   │   ├── auth.service.ts
│   │   ├── restaurant.service.ts
│   │   ├── product.service.ts
│   │   ├── menu.service.ts
│   │   ├── order.service.ts
│   │   ├── address.service.ts
│   │   ├── motorcycle.service.ts
│   │   ├── driver.service.ts
│   │   ├── shift.service.ts
│   │   ├── issue.service.ts
│   │   ├── customer.service.ts
│   │   ├── photo.service.ts
│   │   ├── notification.service.ts
│   │   ├── chart.service.ts
│   │   └── chatbot.service.ts
│   ├── guards/             # Guards de routing
│   │   └── auth.guard.ts
│   ├── interceptors/       # Interceptores HTTP
│   │   └── auth.interceptor.ts
│   ├── config/             # Configuraciones
│   │   ├── firebase.config.ts
│   │   └── theme.config.ts
│   ├── app.component.ts    # Componente raíz
│   └── app.routes.ts       # Rutas de la aplicación
├── assets/                 # Recursos estáticos
│   └── sounds/            # Sonidos de notificaciones
└── styles.css              # Estilos globales

mock-server/
└── server.js              # Servidor mock para datos de gráficos
```

## 🎨 Tecnologías Utilizadas

- **Angular 18**: Framework principal con componentes standalone
- **Angular Material**: Componentes UI modernos
- **Firebase**: Autenticación OAuth
- **Chart.js / ng2-charts**: Gráficos e informes visuales
- **Google Maps API**: Mapas interactivos
- **Google Gemini API**: Chatbot inteligente
- **RxJS**: Programación reactiva
- **TypeScript**: Lenguaje de programación
- **HttpClient**: Peticiones HTTP con interceptores

## 📝 Notas Importantes

1. **Backend API**: El backend debe estar corriendo en `http://localhost:5000`. El código del backend se encuentra en: https://github.com/felipebuitragocarmona/ms_delivery

2. **API Keys**:
   - **Gemini**: Obtén tu API Key en [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Google Maps**: Obtén tu API Key en [Google Cloud Console](https://console.cloud.google.com/)

3. **Sonidos de Notificaciones**: Asegúrate de tener los archivos de sonido en `src/assets/sounds/`:
   - `nuevo.mp3`
   - `actualizado.mp3`
   - `cancelado.mp3`

4. **Servidor Mock**: El servidor mock para gráficos es opcional. Si no lo ejecutas, los gráficos mostrarán un error de conexión.

## 🚀 Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run build`: Construye el proyecto para producción
- `npm run mock-server`: Inicia el servidor mock para gráficos
- `npm test`: Ejecuta las pruebas unitarias

## 🔒 Seguridad

- Todas las peticiones HTTP incluyen automáticamente el token de autorización
- Las rutas están protegidas con guards de autenticación
- Los tokens se almacenan en localStorage de forma segura

## 📱 Responsive Design

La aplicación está completamente adaptada para:
- Dispositivos de escritorio
- Tablets
- Teléfonos móviles

## 🎯 Funcionalidades Adicionales

- **Validaciones de formularios**: Todos los formularios incluyen validaciones completas
- **Manejo de errores**: Mensajes de error amigables al usuario
- **Notificaciones toast**: Feedback visual para todas las operaciones
- **Tema oscuro**: Interfaz moderna con tema oscuro personalizado

## 📄 Licencia

Este proyecto es parte de un sistema de gestión de domicilios desarrollado para facilitar la interacción entre restaurantes, clientes y repartidores.

