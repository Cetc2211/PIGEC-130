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

---
## Task ID: banco-de-pruebas
### Work Task
Create a "Banco de Pruebas" (Test Bank) component for individual student clinical expedientes at `/home/z/my-project/PIGEC-130/src/components/banco-de-pruebas.tsx`.

### Work Summary
Created the complete `banco-de-pruebas.tsx` component (953 lines) with the following features:

1. **Props**: Receives `studentId` and `studentName` for individual student context
2. **Clinical Test Catalog**: 15 clinical-only tests organized by 6 categories:
   - Depresión (red): PHQ-9, BDI-II, HADS, BHS
   - Ansiedad (blue): GAD-7, BAI, IDARE/STAI
   - Ideación Suicida (orange): SSI, Plutchik, Columbia C-SSRS, CDFR
   - Pensamientos Automáticos (purple): IPA
   - Abuso de Sustancias (yellow): ASSIST
   - Evaluación Neuropsicológica (teal): Tamizaje Neuropsicológico
3. **Two-step workflow**: Step 1 (Select Tests) → Step 2 (Generate & Send)
4. **Link generation**: Creates unique session link routing to `/evaluar-individual/[sessionId]?expedienteId=...`
5. **Share functionality**: WhatsApp and Email sharing with formatted messages
6. **Firestore integration**: Saves sessions to `individual_evaluation_sessions` collection
7. **Preview dialog**: Reuses `ScreeningInstrumentDialog` for each test preview
8. **Category features**: Color-coded headers, select-all per category, risk badges for suicidal tests
9. **UI**: Uses shadcn/ui components, lucide-react icons, professional medical styling, Spanish language
10. **Notas Importantes**: Explains test exclusivity to the student's expediente

Files created: `src/components/banco-de-pruebas.tsx`
Followed existing project patterns from `screening-management.tsx`, `ScreeningInstrumentDialog.tsx`, and `use-toast.ts`.
