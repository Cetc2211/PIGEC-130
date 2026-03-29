---
Task ID: 1
Agent: Main Agent
Task: Crear sección "Expedientes" en el menú principal y mover los expedientes del Dashboard

Work Log:
- Analicé la estructura actual: Sidebar (`sidebar.tsx`), Dashboard (`dashboard/page.tsx` + `student-dashboard.tsx`), expedientes clínicos (`/clinica/expediente/[id]`) y educativos (`/educativa/estudiante/[id]`)
- Identifiqué que `StudentDashboard` es el componente que renderiza la tabla de expedientes en `/dashboard`
- Creé nueva ruta `/expedientes` (`src/app/expedientes/page.tsx`) que importa el mismo `StudentDashboard` sin modificaciones
- Actualicé el Sidebar para agregar "Expedientes" con icono `FolderOpen`, visible para ambos roles (Clinico y Orientador)
- Mejoré la detección de ruta activa: "Expedientes" se mantiene resaltado al navegar a `/clinica/expediente/*` o `/educativa/estudiante/*`
- Transformé el Dashboard en página de resumen con: tarjetas de conteo por nivel de riesgo, resumen compacto de estudiantes con IRC, y accesos rápidos a las secciones principales

Stage Summary:
- Archivos creados: `src/app/expedientes/page.tsx`
- Archivos modificados: `src/components/sidebar.tsx`, `src/app/dashboard/page.tsx`
- Funcionalidades internas de expedientes NO modificadas (rutas clínicas/educativas, datos de store.ts, componentes de formularios)
- El menú ahora tiene 7 items: Dashboard de Riesgo, Expedientes, Panel de Orientación, Evaluación Educativa, Gestión de Pruebas, Repositorio de Recursos, Administración
