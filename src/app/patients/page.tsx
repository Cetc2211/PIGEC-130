'use server';

import { PatientPageClient } from '@/components/patient-page-client';
import { getAllPatients, getAllAssignedQuestionnaires, Assignment } from '@/lib/store';

export default async function PatientsPage() {
  const patients = getAllPatients();
  const assignments = getAllAssignedQuestionnaires();

  const assignmentsByPatient = assignments.reduce((acc, assignment) => {
      const key = assignment.patientId;
      if (!acc[key]) {
          acc[key] = [];
      }
      acc[key].push(assignment);
      return acc;
  }, {} as Record<string, Assignment[]>);


  return <PatientPageClient patients={patients} assignmentsByPatient={assignmentsByPatient} />;
}
