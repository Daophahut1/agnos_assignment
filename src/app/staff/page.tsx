import StaffDashboard from '@/components/StaffDashboard';
import RealtimeProvider from '@/components/RealtimeProvider';

export default function StaffPage() {
  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <h1 className="text-xl font-bold text-primary-dark">Staff Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Dr. Smith</span>
              <div className="relative">
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold text-gray-700">DS</div>
                <span className="absolute -right-0.5 -bottom-0.5 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
            </div>
          </div>
        </header>
        <main className="py-8">
          <StaffDashboard />
        </main>
      </div>
    </RealtimeProvider>
  );
}
