'use client';

import { useState, useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';

interface PatientData {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  language: string;
  nationality: string;
  religion: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  id?: string;
  submittedAt?: string;
  reviewed?: boolean;
}

export default function StaffDashboard() {
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [submissions, setSubmissions] = useState<PatientData[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<PatientData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(() => Date.now());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('update-dashboard', (data: PatientData) => {
      setCurrentPatient(data);
      setIsTyping(true);
      setLastActivity(Date.now());
    });

    socket.on('initial-submissions', (list: PatientData[]) => {
      setSubmissions(list || []);
    });

    socket.on('new-submission', (data: PatientData) => {
      // server provides submittedAt, reviewed, id
      setSubmissions((prev) => [data, ...prev]);
      setCurrentPatient(null); // Clear current view on submission
      setIsTyping(false);
    });

    socket.on('review-updated', (payload: { id: string; reviewed: boolean }) => {
      setSubmissions((prev) => prev.map((s) => (s.id === payload.id ? { ...s, reviewed: payload.reviewed } : s)));
      setSelectedSubmission((cur) => (cur && cur.id === payload.id ? { ...cur, reviewed: payload.reviewed } : cur));
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('update-dashboard');
      socket.off('new-submission');
      socket.off('initial-submissions');
      socket.off('review-updated');
    };
  }, []);

  // Check for inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 2000) {
        setIsTyping(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  function markReviewed(target: PatientData | null) {
    if (!target || !target.id) return;
    // optimistic update locally
    setSubmissions((prev) => prev.map((s) => (s.id === target.id ? { ...s, reviewed: !s.reviewed } : s)));
    if (selectedSubmission && selectedSubmission.id === target.id) {
      setSelectedSubmission((cur) => (cur ? { ...cur, reviewed: !cur.reviewed } : cur));
    }
    // notify server to persist and broadcast
    socket.emit('mark-reviewed', target.id);
  }

  // --- Toasts for action feedback (copy / mark reviewed) ---
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: 'success' | 'info' | 'error' }[]>([]);
  const toastIdRef = useRef(0);

  function showToast(message: string, type: 'success' | 'info' | 'error' = 'info') {
    const id = ++toastIdRef.current;
    setToasts((s) => [{ id, message, type }, ...s]);
    // auto-dismiss after 3s
    setTimeout(() => {
      setToasts((s) => s.filter((t) => t.id !== id));
    }, 3000);
  }

  function getSubmissionId(s: PatientData, idx: number) {
    return s.submittedAt ?? `${s.email || 'no-email'}-${s.firstName || 'no-name'}-${idx}`;
  }

  // Action handlers extracted for clarity
  function handleCopy(sub: PatientData) {
    navigator.clipboard?.writeText(JSON.stringify(sub, null, 2))
      .then(() => showToast('Copied submission to clipboard', 'success'))
      .catch(() => showToast('Failed to copy', 'error'));
  }

  function handlePrint() {
    window.print();
    showToast('Print dialog opened', 'info');
  }

  function handleToggleReviewed(sub: PatientData) {
    markReviewed(sub);
    const next = !sub.reviewed;
    showToast(next ? 'Marked as reviewed' : 'Marked as unreviewed', 'success');
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast container */}
      <div aria-live="polite" className="fixed top-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
          <div key={t.id} className={`min-w-[200px] max-w-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 border ${t.type === 'success' ? 'border-green-100' : t.type === 'error' ? 'border-red-100' : 'border-gray-100'} bg-white`}>
            <div className={`w-2 h-8 rounded ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-primary'}`} />
            <div className="text-sm text-gray-700">{t.message}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Live Monitor */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[420px] sm:min-h-[520px] md:min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 border-b border-gray-200/50 pb-4 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-primary-dark flex items-center gap-3">
                  <span className="relative flex h-4 w-4">
                    {isTyping && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-4 w-4 ${isTyping ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  </span>
                  Live Patient Monitor
                </h2>
                <p className="text-sm md:text-sm text-gray-500 mt-1 md:mt-1 ml-0 md:ml-7">Real-time data synchronization</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isTyping ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  Status: {isTyping ? 'Active' : 'Idle'}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
                {isTyping && <span className="text-sm text-primary font-medium animate-pulse">Receiving Data...</span>}
              </div>
            </div>

            {currentPatient ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Identity Card */}
                <div className="bg-linear-to-br from-primary/5 to-white p-4 sm:p-6 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary">
                      {currentPatient.gender === 'female' ? '👩' : '👨'}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-primary-dark">
                        {currentPatient.firstName} {currentPatient.middleName} {currentPatient.lastName}
                      </h3>
                      <p className="text-gray-500">{currentPatient.email || 'No email provided'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <FieldDisplay label="DOB" value={currentPatient.dob} icon="📅" />
                    <FieldDisplay label="Gender" value={currentPatient.gender} icon="⚧" />
                    <FieldDisplay label="Phone" value={currentPatient.phone} icon="📞" />
                    <FieldDisplay label="Language" value={currentPatient.language} icon="🗣" />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-primary-dark mb-4 flex items-center gap-2">
                      <span>📍</span> Address & Background
                    </h4>
                    <p className="text-gray-700 text-base sm:text-lg mb-4">{currentPatient.address || <span className="text-gray-300 italic">Not entered</span>}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-sm text-gray-500">Nationality</div>
                        <div className="font-medium">{currentPatient.nationality || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Religion</div>
                        <div className="font-medium">{currentPatient.religion || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-primary-dark mb-4 flex items-center gap-2">
                      <span>🚨</span> Emergency Contact
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{currentPatient.emergencyContactName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Relation:</span>
                        <span className="font-medium">{currentPatient.emergencyContactRelation || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium">{currentPatient.emergencyContactPhone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                </div>
                <h3 className="text-xl font-medium text-gray-400">Waiting for patient signal...</h3>
                <p className="text-gray-400 mt-2">Live updates will appear here automatically</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="glass-panel rounded-3xl p-6 h-fit md:sticky md:top-6">
          <h2 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Recent Submissions
          </h2>
          <div className="space-y-4 max-h-80 sm:max-h-[520px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-200">
                No submissions yet
              </div>
            ) : (
              submissions.map((sub, idx) => (
                <div
                  key={getSubmissionId(sub, idx)}
                  onClick={() => setSelectedSubmission(sub)}
                  className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-transform transform hover:-translate-y-1 hover:shadow-lg cursor-pointer group overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${sub.reviewed ? 'bg-green-400' : 'bg-linear-to-br from-primary to-accent'}`}>
                      {sub.firstName?.[0] || 'P'}{sub.lastName?.[0] || 'N'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-primary-dark truncate">{sub.firstName} {sub.lastName}</div>
                        <div className="flex items-center gap-2">
                          {sub.reviewed ? (
                            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">REVIEWED</span>
                          ) : (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">NEW</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 truncate">{sub.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : new Date().toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-2 text-primary font-medium group-hover:underline">
                      View Details
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          {/* Submission Detail Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedSubmission(null)} />
              <div role="dialog" aria-modal="true" aria-labelledby="submission-title" onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-0 w-full max-w-lg sm:max-w-3xl mx-4 animate-in fade-in zoom-in-95 z-10 overflow-hidden max-h-[90vh]">
                {/* Modal header with gradient (responsive) */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 bg-linear-to-r from-primary to-accent text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-white/10 ring-1 ring-white/20 text-2xl font-bold shrink-0">
                      {selectedSubmission.gender === 'female' ? '♀️' : '♂️'}
                    </div>
                    <div className="min-w-0">
                      <h3 id="submission-title" className="text-base sm:text-lg font-extrabold truncate">{selectedSubmission.firstName} {selectedSubmission.middleName} {selectedSubmission.lastName}</h3>
                      <div className="text-sm text-white/90 mt-1 truncate">{selectedSubmission.email || 'No email provided'} • {selectedSubmission.phone || '-'}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                    <button onClick={(e) => { e.stopPropagation(); handleCopy(selectedSubmission); }} className="text-white/90 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-xs sm:text-sm">Copy</button>
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(); }} className="text-white/90 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-xs sm:text-sm">Print</button>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleReviewed(selectedSubmission); }} className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${selectedSubmission.reviewed ? 'bg-green-600 text-white' : 'bg-white/90 text-primary-dark'}`}>
                      {selectedSubmission.reviewed ? 'Reviewed' : 'Mark reviewed'}
                    </button>
                    <button onClick={() => setSelectedSubmission(null)} aria-label="Close" className="ml-0 sm:ml-2 text-white/90 hover:text-white text-lg">✕</button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-white overflow-y-auto max-h-[65vh] sm:max-h-[75vh]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date of Birth</div>
                        <div className="font-medium text-gray-800">{selectedSubmission.dob || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gender</div>
                        <div className="font-medium text-gray-800">{selectedSubmission.gender || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Language</div>
                        <div className="font-medium text-gray-800">{selectedSubmission.language || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nationality</div>
                        <div className="font-medium text-gray-800">{selectedSubmission.nationality || '-'}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</div>
                        <div className="font-medium text-gray-800 wrap-break-word">{selectedSubmission.address || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Religion</div>
                        <div className="font-medium text-gray-800">{selectedSubmission.religion || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Submitted</div>
                        <div className="text-sm text-gray-800">{selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : new Date().toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-semibold text-primary-dark mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Name</div>
                        <div className="font-medium">{selectedSubmission.emergencyContactName || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Relation</div>
                        <div className="font-medium">{selectedSubmission.emergencyContactRelation || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium">{selectedSubmission.emergencyContactPhone || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

function FieldDisplay({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`font-medium truncate ${value ? 'text-gray-900' : 'text-gray-300 italic'}`}>
        {value || '-'}
      </div>
    </div>
  );
}

// DetailRow removed — modal now uses inline rows and chips for a more modern layout.

