'use server';

import { PatientPageClient } from '@/components/patient-page-client';
import { getAllPatients } from '@/lib/store';

export default async function PatientsPage() {
  // Al ser un Componente de Servidor, esto se ejecuta en el servidor
  // y obtiene la lista más reciente de pacientes cada vez que se renderiza.
  const patients = getAllPatients();

  return <PatientPageClient patients={patients} />;
}
