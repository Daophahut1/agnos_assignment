import PatientForm from '@/components/PatientForm';
import RealtimeProvider from '@/components/RealtimeProvider';

export default function PatientPage() {
  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-dark">Patient Intake Portal</h1>
          <p className="mt-2 text-gray-600">Please fill out your information below.</p>
        </div>
        <PatientForm />
      </div>
    </RealtimeProvider>
  );
}
