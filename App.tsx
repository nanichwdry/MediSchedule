import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import VapiInterface from './components/VapiInterface';
import AppChatbot from './components/AppChatbot';
import RAGInterface from './components/RAGInterface';
import PatientDetails from './components/PatientDetails';
import { db } from './services/db';
import { Appointment, Patient, AppointmentStatus } from './types';
import { Pencil, X, Save, Eye, Phone, Mail, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<string>('ALL');

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const appts = await db.getAppointments();
        const pats = await db.getPatients();
        console.log('Loaded appointments:', appts.length);
        console.log('Loaded patients:', pats.length);
        setAppointments(appts);
        setPatients(pats);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePatientClick = (patient: Patient) => {
    setViewingPatient(patient);
  };

  const handleAppointmentFilter = (filter: string) => {
    setAppointmentFilter(filter);
    setActiveTab('schedule');
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    const updated = await db.updateAppointment(id, { status });
    if (updated) {
      setAppointments(prev => prev.map(a => a._id === id ? updated : a));
    }
  };

  const handleCallComplete = async (transcript: string, summary: string) => {
    // Simulate booking an appointment based on the call
    // In a real app, the summary might parse a specific date. 
    // Here we'll just book a slot next Tuesday for demo purposes as per the script.
    
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(14, 30, 0, 0);

    const newAppt = await db.insertAppointment({
      patientId: patients[0]._id, // Simplified for demo
      patientName: patients[0].name,
      date: nextWeek.toISOString(),
      durationMinutes: 30,
      status: AppointmentStatus.SCHEDULED,
      type: 'Follow-up',
      notes: summary,
      transcription: transcript,
      aiSummary: summary
    });

    setAppointments(prev => [...prev, newAppt]);
    
    // Switch to schedule view to show the new appointment
    setTimeout(() => {
        alert("Appointment successfully booked via Voice Agent!");
        setActiveTab('schedule');
    }, 500);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    const updated = await db.updatePatient(editingPatient._id, editingPatient);
    if (updated) {
        setPatients(prev => prev.map(p => p._id === updated._id ? updated : p));
        setEditingPatient(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-emerald-500 font-medium animate-pulse">Initializing MediSchedule System...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          appointments={appointments} 
          patients={patients}
          onPatientClick={handlePatientClick}
          onAppointmentFilter={handleAppointmentFilter}
        />
      )}
      {activeTab === 'schedule' && (
        <Schedule 
          appointments={appointments} 
          onStatusChange={handleStatusChange}
          initialFilter={appointmentFilter}
          onPatientClick={handlePatientClickFromSchedule}
        />
      )}
      {activeTab === 'calls' && (
        <VapiInterface patients={patients} onCallComplete={handleCallComplete} />
      )}
      {activeTab === 'rag' && <RAGInterface />}
      {activeTab === 'patients' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Patient Directory</h2>
                <p className="text-slate-400">Manage patient records and risk profiles</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset Demo Data
                </button>
                <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20">
                    + Add Patient
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(p => (
                <div key={p._id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-left hover:border-slate-700 transition-all group relative cursor-pointer hover:scale-[1.02]">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingPatient(p);
                            }}
                            className="p-2 bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-400 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPatient(p);
                            }}
                            className="p-2 bg-slate-800 hover:bg-primary-500 hover:text-white text-slate-400 rounded-lg transition-colors"
                            title="Edit Patient"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => setViewingPatient(p)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                               {p.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-white">{p.name}</h3>
                              <p className="text-slate-500 text-xs uppercase tracking-wider">Age: {p.age || 'N/A'} • ID: {p._id.slice(0,6)}</p>
                          </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                           <div className="text-sm text-slate-300 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-500" />
                              <span className="truncate max-w-[200px]">{p.email}</span>
                           </div>
                           <div className="text-sm text-slate-300 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-500" />
                              <span>{p.phone}</span>
                           </div>
                           <div className="text-sm text-slate-300 flex justify-between">
                              <span className="text-slate-500">Insurance:</span> 
                              <span className="truncate max-w-[150px]">{p.insurance || 'Not specified'}</span>
                           </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-slate-500 text-sm">Risk Profile</span>
                          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                              p.riskProfile === 'High' ? 'border-red-500/20 bg-red-500/10 text-red-500' :
                              p.riskProfile === 'Moderate' ? 'border-amber-500/20 bg-amber-500/10 text-amber-500' :
                              'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                          }`}>
                              {p.riskProfile} Risk
                          </span>
                      </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {viewingPatient && (
        <PatientDetails 
          patient={viewingPatient}
          appointments={appointments}
          onClose={() => setViewingPatient(null)}
        />
      )}

      {/* Floating RAG Bot Icon - Always visible */}
      <AppChatbot />

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit Patient</h3>
              <button 
                onClick={() => setEditingPatient(null)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingPatient.name}
                  onChange={e => setEditingPatient({...editingPatient, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingPatient.email}
                  onChange={e => setEditingPatient({...editingPatient, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                <input 
                  type="tel" 
                  value={editingPatient.phone}
                  onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                <input 
                  type="number" 
                  value={editingPatient.age}
                  onChange={e => setEditingPatient({...editingPatient, age: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Insurance Provider</label>
                <input 
                  type="text" 
                  value={editingPatient.insurance}
                  onChange={e => setEditingPatient({...editingPatient, insurance: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Risk Profile</label>
                <select 
                  value={editingPatient.riskProfile}
                  onChange={e => setEditingPatient({...editingPatient, riskProfile: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Moderate">Moderate Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;