import { Header } from '@/components/header';
import StudentDashboard from '@/components/student-dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <StudentDashboard />
      </main>
    </div>
  );
}
