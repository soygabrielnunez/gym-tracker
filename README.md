# Gym Tracker

Un simple pero potente tracker de gimnasio para crear, seguir y gestionar tus rutinas de entrenamiento. Construido con Nuxt.js, este proyecto es una aplicación de página única (SPA) que funciona completamente en el lado del cliente y persiste los datos en el `localStorage` de tu navegador.

## Características Principales

- **Creación de Rutinas**: Diseña rutinas de entrenamiento personalizadas con múltiples ejercicios.
- **Sesiones de Entrenamiento**: Inicia sesiones de entrenamiento basadas en tus rutinas o comienza un entrenamiento libre.
- **Historial de Sesiones**: Revisa tus entrenamientos completados para seguir tu progreso.
- **Gestión de Datos**:
  - **Exportar**: Guarda tus rutinas como archivos `.json` para tener copias de seguridad o compartirlas.
  - **Importar**: Carga rutinas desde archivos `.json` para una configuración rápida.
- **Interfaz Limpia y Reactiva**: Construido con Vue.js y Nuxt.js para una experiencia de usuario fluida.
- **100% Local**: Todos tus datos se guardan de forma segura en tu propio navegador. No se requiere conexión a internet ni registro.

## Tecnologías Utilizadas

- **Framework**: [Nuxt.js 4](https://nuxt.com/)
- **UI Framework**: [Vue.js 3](https://vuejs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: CSS nativo con variables para un theming sencillo.
- **Persistencia**: `localStorage` del navegador.

## Instalación y Uso

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- Node.js (versión 18.x o superior)
- npm

### Pasos

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

- `app/`: Contiene toda la lógica y vistas de la aplicación Nuxt.
  - `components/`: Componentes de Vue reutilizables (`InputModal.vue`, `ConfirmModal.vue`).
  - `composables/`: Lógica de estado y funciones (`useWorkouts.ts`).
  - `pages/`: Define las rutas de la aplicación.
  - `assets/`: Estilos globales y otros recursos.
- `public/`: Archivos estáticos.
- `nuxt.config.ts`: Archivo de configuración de Nuxt.
- `package.json`: Dependencias y scripts del proyecto.
