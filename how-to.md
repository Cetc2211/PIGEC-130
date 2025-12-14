# Cómo subir tu proyecto a GitHub

Sigue estos pasos para llevar tu proyecto desde tu máquina local a un nuevo repositorio en GitHub.

### 1. Inicializa un repositorio de Git

En tu terminal, navega al directorio raíz de tu proyecto y ejecuta el siguiente comando para inicializar un repositorio de Git local:

```bash
git init -b main
```

### 2. Añade todos los archivos al área de preparación (staging)

Añade todos los archivos de tu proyecto al área de preparación para que Git les dé seguimiento:

```bash
git add .
```

### 3. Confirma (commit) los archivos

Confirma los archivos preparados con un mensaje descriptivo:

```bash
git commit -m "Commit inicial"
```

### 4. Crea un nuevo repositorio en GitHub

- Ve a [GitHub](https://github.com) e inicia sesión en tu cuenta.
- Haz clic en el ícono **+** en la esquina superior derecha y selecciona **New repository** (Nuevo repositorio).
- Dale un nombre a tu repositorio (por ejemplo, `mi-app-nextjs`).
- Puedes añadir una descripción opcional.
- Elige si el repositorio será público o privado.
- **Importante**: No inicialices el nuevo repositorio con un archivo README, .gitignore o licencia. Tu proyecto ya contiene estos archivos.
- Haz clic en **Create repository** (Crear repositorio).

### 5. Vincula tu repositorio local con el repositorio de GitHub

En la siguiente página, GitHub te proporcionará la URL de tu repositorio. Cópiala y úsala en el siguiente comando para vincular tu repositorio local con el remoto en GitHub.

Reemplaza `<URL_DE_TU_REPOSITORIO>` con la URL que copiaste.

```bash
git remote add origin <URL_DE_TU_REPOSITORIO>
```

Por ejemplo:
`git remote add origin https://github.com/tu-usuario/mi-app-nextjs.git`

### 6. Sube (push) tus cambios a GitHub

Finalmente, sube tus archivos confirmados a tu repositorio en GitHub:

```bash
git push -u origin main
```

¡Y eso es todo! Tu proyecto ahora está alojado en GitHub.
