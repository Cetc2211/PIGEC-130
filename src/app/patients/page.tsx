'use server';

import { PatientPageClient } from '@/components/patient-page-client';
import { getAllPatients, getAllAssignedQuestionnaires } from '@/lib/store';

export default async function PatientsPage() {
  const patients = getAllPatients();
  const assignments = getAllAssignedQuestionnaires();

  return <PatientPageClient patients={patients} assignments={assignments} />;
}
