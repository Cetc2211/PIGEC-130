import { Header } from '@/components/header';
import { StudentDashboard } from '@/components/student-dashboard';
import { getStudents, getEvaluations } from '@/lib/store';
import { calculateRiskIndex } from '@/lib/risk-analysis';

export default function DashboardPage() {
  const students = getStudents();
  const evaluations = getEvaluations();

  const studentsWithRisk = students.map(student => {
    const studentEvaluations = evaluations.filter(e => e.studentId === student.id);
    const latestGpa = student.academicData.gpa;
    const latestAbsences = student.academicData.absences;
    const latestGad7 = studentEvaluations.find(e => e.type === 'GAD-7')?.score;

    const riskData = {
      gpa: latestGpa,
      absences: latestAbsences,
      gad7Score: latestGad7
    };

    const riskIndex = calculateRiskIndex(riskData);

    return {
      ...student,
      riskIndex: riskIndex.IRC
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <StudentDashboard students={studentsWithRisk} />
      </main>
    </div>
  );
}
