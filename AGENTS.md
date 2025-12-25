# AGENTS.md - Guía para Agentes

Esta guía proporciona directrices y contexto para trabajar en el proyecto Gym Tracker.

## Arquitectura del Proyecto

Este es un proyecto **Nuxt.js 4** que funciona como una **Single Page Application (SPA)**. Toda la lógica se ejecuta en el lado del cliente y no depende de un backend.

- **Framework**: Nuxt.js (con Vue 3).
- **Gestión de Estado**: El estado global se gestiona a través de **Vue Composables** (`app/composables/`). El composable principal es `useWorkouts.ts`, que centraliza toda la lógica de negocio para rutinas, sesiones e historial.
- **Persistencia de Datos**: Los datos del usuario (rutinas e historial) se persisten exclusivamente en el `localStorage` del navegador. El estado es reactivo gracias a `useState` de Nuxt y se sincroniza con `localStorage` mediante `watch` y el hook `onMounted`.
- **Enrutamiento**: Nuxt utiliza un sistema de enrutamiento basado en archivos. Las páginas se encuentran en el directorio `app/pages/`.
- **Estilos**: Se utilizan estilos CSS nativos con variables CSS. No hay frameworks de CSS externos.

## Convenciones y Buenas Prácticas

1.  **Idioma**: Toda la interfaz de usuario y los mensajes deben estar en **español**.
2.  **Componentes**:
    - Los componentes reutilizables (como modales) se encuentran en `app/components/`.
    - Mantén los componentes lo más desacoplados posible. Utiliza `props` para pasar datos y `emits` para comunicar eventos hacia arriba.
3.  **Estado y Lógica**:
    - **Evita la lógica de negocio en los componentes**. Los componentes de Vue deben centrarse en la presentación y la interacción del usuario.
    - Centraliza toda la lógica de manipulación de datos (crear, leer, actualizar, eliminar) en el composable `useWorkouts.ts`.
4.  **Acceso a `localStorage`**:
    - **Importante**: Debido a que Nuxt.js renderiza en el servidor (SSR) durante el desarrollo y la compilación, el acceso a APIs del navegador como `localStorage` o `document` debe realizarse **únicamente dentro de hooks de ciclo de vida del lado del cliente**, como `onMounted`, o dentro de bloques condicionales `if (import.meta.client)`. No hacerlo provocará errores de hidratación.
5.  **No hay Pruebas Configuradas**:
    - El proyecto no cuenta con un script de pruebas (`npm test`) configurado. Al realizar cambios, es crucial verificar manualmente la funcionalidad en el navegador.

## Flujo de Trabajo Típico

Para agregar una nueva funcionalidad:

1.  **Analiza `useWorkouts.ts`**: Determina si necesitas agregar o modificar funciones de estado existentes.
2.  **Crea o Modifica Componentes**: Desarrolla los componentes de la interfaz de usuario en `app/components/` o `app/pages/`.
3.  **Conecta la Lógica**: Llama a las funciones del composable desde tus componentes para manejar eventos y mostrar datos.
4.  **Verificación Manual**: Inicia el servidor de desarrollo (`npm run dev`) y prueba exhaustivamente los cambios en el navegador. Asegúrate de que no haya errores en la consola, especialmente relacionados con la hidratación (mismatch entre servidor y cliente).

## Funcionalidades Clave Implementadas

### Persistencia de la Sesión Activa

- **Objetivo**: Permitir al usuario reanudar un entrenamiento activo si recarga la página o cierra la aplicación.
- **Implementación**:
  1.  **`useWorkouts.ts`**:
      - El estado `activeSession` se sincroniza con `localStorage` bajo la clave `gym-active-session`.
      - Un `watch` se encarga de guardar cualquier cambio en `activeSession` en `localStorage`.
      - Cuando la sesión termina (`finishSession`), `activeSession` se establece en `null`, y el `watch` elimina la entrada de `localStorage`.
  2.  **`app.vue`**:
      - En el hook `onMounted`, la aplicación comprueba si existe una `activeSession` en el estado (cargada desde `localStorage` por `useWorkouts.ts`).
      - Si se encuentra una sesión y el usuario no está ya en la página de esa sesión, se le redirige automáticamente a `/session/[id]`.
