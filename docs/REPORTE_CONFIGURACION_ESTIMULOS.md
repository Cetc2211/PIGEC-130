# ✅ Reporte de Configuración: Carga de Estímulos Visuales

**Fecha:** [Fecha Actual]
**Proyecto:** PIGEC-130 / `academic-tracker-qeoxi`

---

## 1. Objetivo

Este documento resume la configuración técnica implementada para asegurar la carga y visualización de los estímulos psicométricos (imágenes de las subpruebas WISC/WAIS) desde **Firebase Storage** dentro de la **Consola de Aplicación** de la plataforma.

## 2. Componentes Clave de la Configuración

El sistema se basa en tres pilares fundamentales que deben funcionar en armonía:

### Pilar A: Estructura de Archivos en la Nube (Firebase Storage)

Es la "biblioteca" donde se guardan todas las imágenes. Para que la aplicación pueda encontrarlas, deben seguir una estructura de nombres y carpetas muy específica.

-   **Bucket de Almacenamiento:** `gs://academic-tracker-qeoxi.firebasestorage.app`
-   **Carpeta Raíz para Estímulos:** `/stimuli/`
-   **Formato de Ruta:** `stimuli/{ID_SUBPRUEBA}/item{NUMERO_ITEM}.webp.png`

**Ejemplos Concretos:**
- El estímulo para el ítem 5 de la subprueba **Construcción con Cubos (C)** debe estar en:
  `stimuli/C/item5.webp.png`
- El estímulo para el ítem 12 de **Puzles Visuales (PV)** debe estar en:
  `stimuli/PV/item12.webp.png`

**Estado Actual:**
- **[✓] COMPLETADO:** Has subido correctamente la carpeta `stimuli-assets` a la nube bajo el nombre `stimuli`, estableciendo esta estructura con éxito.

### Pilar B: Configuración del Cliente (Código de la Aplicación)

Es la parte de la aplicación que "sabe" cómo conectarse a Firebase y pedir las imágenes.

-   **Archivo de Conexión (`src/lib/firebase.ts`):**
    -   Este archivo contiene las "llaves" (`apiKey`, `authDomain`, etc.) que autorizan a tu aplicación a hablar con tu proyecto de Firebase.
    -   **Punto Crítico Corregido:** La `apiKey` y el `storageBucket` han sido verificados y corregidos para coincidir exactamente con los de tu proyecto, solucionando los errores previos de `BucketNotFound` y `retry-limit-exceeded`.

-   **Componente de Visualización (`src/components/WISC-VScoringConsole.tsx`):**
    -   Dentro de este archivo, un sub-componente llamado `StimulusDisplay` es el encargado de la lógica de carga.
    -   **Flujo de Trabajo:**
        1.  Recibe el ID de la subprueba (ej. "C") y el número de ítem (ej. 1).
        2.  Construye dinámicamente la ruta de la imagen siguiendo el formato del Pilar A (ej. `stimuli/C/item1.webp.png`).
        3.  Utiliza la función `getDownloadURL` de Firebase para obtener un enlace de descarga seguro y temporal para esa imagen.
        4.  Implementa una **caché en memoria** (`imageUrlCache`) para que, una vez que una imagen se descarga, no se vuelva a solicitar a la red durante la misma sesión, haciendo la navegación entre ítems casi instantánea.
        5.  Muestra la imagen usando el componente `next/image` para una carga optimizada.
        6.  **Plan de Contingencia:** Si, por cualquier motivo excepcional, la imagen no se puede cargar, el componente ahora muestra una tarjeta de respaldo que instruye al clínico a usar el cuadernillo físico para ese ítem, garantizando que la aplicación nunca quede bloqueada.

### Pilar C: Reglas de Seguridad (Firebase Storage Rules)

Define quién puede acceder a los archivos. Aunque no fue parte del problema, es un pilar de seguridad.

-   **Archivo de Reglas (`storage.rules`):**
    -   Actualmente, las reglas están configuradas para permitir que cualquier usuario autenticado (`request.auth != null`) pueda leer los estímulos. Esto es adecuado para la fase de desarrollo.
    -   En un futuro, se podría restringir el acceso solo a usuarios con un rol específico (ej. `request.auth.token.role == 'clinico'`) para mayor seguridad.

## 3. Conclusión

Con la corrección de la `apiKey` y la implementación de la caché de imágenes y el plan de contingencia, la configuración para la carga de estímulos es ahora **robusta, rápida y resiliente**. Todos los componentes necesarios están en su lugar para cumplir con el objetivo de una aplicación 100% digital y sin papel.
