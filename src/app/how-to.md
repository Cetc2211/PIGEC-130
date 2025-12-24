# Cómo Subir Tu Proyecto a GitHub

Esta guía contiene dos métodos para subir tu proyecto a GitHub. Elige el que mejor se adapte a tu dispositivo:

1.  **Método Manual (Ideal para iPad):** No requiere consola ni descargas.
2.  **Método con Consola y Git (Laptop):** El método estándar y más eficiente para desarrolladores.

---

## Método 1: Manual sin Consola (Ideal para iPad)

Este método consiste en replicar la estructura de tu proyecto creando cada archivo y carpeta directamente en la interfaz web de GitHub y copiando el contenido. Funciona perfectamente desde el navegador de un iPad o cualquier computadora.

### 1. Crea un Nuevo Repositorio en GitHub

*   Ve a [GitHub](https://github.com) e inicia sesión.
*   Haz clic en el ícono **+** en la esquina superior derecha y selecciona **New repository**.
*   Dale un nombre (ej., `suite-integral-mtss`).
*   **Importante:** NO marques la casilla "Add a README file" esta vez. Empezaremos con un repositorio completamente vacío para evitar conflictos.
*   Haz clic en **Create repository**.

### 2. Sube tus Archivos y Carpetas Manualmente

Un repositorio vacío te mostrará una página de configuración. Busca y haz clic en el enlace que dice **"creating a new file"**.

*   **Para crear un archivo en la raíz:**
    *   **Nombre del archivo:** Escribe el nombre, por ejemplo: `package.json`.
    *   **Contenido:** Vuelve a este entorno, abre `package.json`, copia TODO su contenido y pégalo en el editor de GitHub.
    *   **Confirmar (Commit):** Escribe un mensaje como `"Add package.json"` y haz clic en **Commit new file**.

*   **Para crear una carpeta y un archivo dentro:**
    *   En la página principal de tu repositorio, haz clic en **Add file** > **Create new file**.
    *   En el campo del nombre, escribe la ruta completa. Por ejemplo, para crear la carpeta `src` y `app` con el archivo `layout.tsx` dentro, escribirías: `src/app/layout.tsx`. Al escribir la barra `/`, GitHub automáticamente crea las carpetas.
    *   **Contenido:** Copia el contenido del archivo `src/app/layout.tsx` de este entorno y pégalo en GitHub.
    *   **Confirmar:** Escribe un mensaje (ej., `"Add layout file"`) y haz clic en **Commit new file**.

Repite este proceso para cada archivo y carpeta de tu proyecto. Es un proceso sistemático, pero te asegura tener una copia exacta de tu código en GitHub.

---

## Método 2: Con Consola y Git (Laptop)

Este es el método profesional. Primero replicarás los archivos en tu laptop y luego usarás `git` para subirlos todos de golpe.

### 1. Prepara tu Laptop

*   **Instala Git:** Si no lo tienes, descárgalo desde [git-scm.com](https://git-scm.com/downloads).
*   **Instala un editor de código:** [VS Code](https://code.visualstudio.com/) es el estándar y tiene una terminal integrada.

### 2. Replica el Proyecto en tu Laptop

1.  **Crea una carpeta:** En tu escritorio o donde prefieras, crea una nueva carpeta. Dale el mismo nombre que tu proyecto (ej. `suite-integral-mtss`).
2.  **Abre la carpeta en VS Code:** Lanza VS Code y ve a `File > Open Folder...` para abrir la carpeta que acabas de crear.
3.  **Crea los archivos y carpetas:** Usando el explorador de archivos de VS Code, recrea la misma estructura de archivos y carpetas que ves en este entorno.
4.  **Copia el contenido:** Para cada archivo, copia el código desde este entorno y pégalo en el archivo correspondiente en VS Code. Guarda cada archivo.

Al final de este paso, tendrás una copia local exacta de tu proyecto en tu laptop.

### 3. Sube el Proyecto con la Consola (Terminal)

1.  **Abre la Consola en VS Code:** Ve al menú `Terminal > New Terminal`. Esto abrirá un panel de consola directamente en tu editor, ya ubicado en la carpeta de tu proyecto.

2.  **Crea un Repositorio en GitHub:** Ve a GitHub.com, crea un **nuevo repositorio vacío** (SIN README ni .gitignore). Después de crearlo, GitHub te mostrará una página con comandos. Busca la sección que empieza con `…or push an existing repository from the command line`.

3.  **Ejecuta los Comandos Git:** Copia y pega los siguientes comandos en tu terminal de VS Code, uno por uno, presionando `Enter` después de cada uno.

    ```bash
    # Inicializa un repositorio Git en tu carpeta local
    git init

    # Añade todos los archivos que creaste para ser "rastreados"
    git add .

    # Crea tu primer "commit" (una instantánea de tu código)
    git commit -m "Primer commit: subida inicial del proyecto"

    # Nombra la rama principal como "main" (estándar actual)
    git branch -M main

    # Conecta tu repositorio local con el de GitHub (reemplaza la URL)
    git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

    # Sube (push) tu código a GitHub
    git push -u origin main
    ```

    **Importante:** Reemplaza `https://github.com/TU_USUARIO/TU_REPOSITORIO.git` con la URL que te proporciona GitHub en la página de tu repositorio.

¡Y listo! Con estos comandos, todo tu proyecto se habrá subido a GitHub. A partir de ahora, cada vez que hagas cambios, solo necesitarás usar `git add .`, `git commit -m "mensaje"`, y `git push`.

---

## 🛠️ Guía: Subir Estímulos a Firebase Storage

Para que la Consola de Evaluación WISC/WAIS funcione, es necesario subir las imágenes de los estímulos (puzles, matrices, etc.) a Firebase Storage.

### Método 1 (Definitivo): Interfaz Gráfica de Google Cloud

Este es el método más simple, visual y a prueba de errores. Funciona perfectamente desde cualquier dispositivo, incluyendo un iPad.

1.  **Ve a Google Cloud Storage:**
    *   Haz clic en este enlace. Te llevará directamente a la "bodega" (bucket) de tu proyecto en Google Cloud.
    *   **Enlace directo:** [https://console.cloud.google.com/storage/browser/academic-tracker-qeoxi.appspot.com](https://console.cloud.google.com/storage/browser/academic-tracker-qeoxi.appspot.com)

2.  **Crea la Carpeta `stimuli`:**
    *   Dentro de la página, busca y haz clic en el botón que dice **"CREAR CARPETA"**.
    *   En el cuadro de diálogo que aparece, nombra la nueva carpeta exactamente `stimuli`.
    *   Haz clic en **"CREAR"**.

3.  **Entra a la Carpeta `stimuli`:**
    *   Haz clic en el nombre de la carpeta `stimuli` que acabas de crear para navegar dentro de ella.

4.  **Sube tus Archivos:**
    *   Ahora que estás dentro de la carpeta `stimuli`, verás los botones **"SUBIR ARCHIVOS"** y **"SUBIR CARPETA"**.
    *   Haz clic en **"SUBIR CARPETA"**.
    *   Se abrirá el explorador de archivos de tu iPad. Navega y selecciona tu carpeta local **`stimuli-assets`** (la que contiene las subcarpetas `C`, `M`, `PV`, etc.).
    *   Confirma la subida. Google Cloud comenzará a subir todas las imágenes y mantendrá la estructura de las subcarpetas automáticamente.

¡Y eso es todo! Una vez que termine la subida, tus estímulos estarán en la ubicación correcta (`stimuli/stimuli-assets/...`) para que la aplicación los pueda usar. Este método evita todos los problemas de la terminal.