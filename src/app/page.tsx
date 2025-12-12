import StudentDashboard from '@/components/student-dashboard';
import { SessionProvider } from '@/context/SessionContext';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <SessionProvider>
          <StudentDashboard />
        </SessionProvider>
      </main>
    </div>
  );
}
