import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-white p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl animate-pulse"></div>
      </div>

      <div className="text-center space-y-8 max-w-3xl relative z-10">
        <div className="inline-block animate-bounce">
          <span className="px-4 py-2 rounded-full bg-white border border-blue-100 text-primary text-sm font-medium shadow-sm">
            Next-Gen Patient Intake
          </span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-primary-dark tracking-tight leading-tight">
          Agnos <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Healthcare</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Experience the future of medical administration with our real-time, synchronized patient intake system. Seamlessly connect patients and staff.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
          <Link href="/patient" className="group relative px-8 py-4 bg-white text-primary-dark font-bold rounded-2xl shadow-lg hover:shadow-xl border border-blue-50 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span>Patient Portal</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </Link>
          
          <Link href="/staff" className="group relative px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span>Staff Dashboard</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-gray-400 text-sm">
        Powered by Next.js & Socket.io
      </div>
    </div>
  );
}
