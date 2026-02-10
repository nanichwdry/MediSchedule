import React from 'react';
import { Patient, Appointment } from '../types';
import { X, Phone, Mail, Calendar, Shield, User, MapPin, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface PatientDetailsProps {
  patient: Patient;
  appointments: Appointment[];
  onClose: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, appointments, onClose }) => {
  const patientAppointments = appointments.filter(a => a.patientId === patient._id);
  const upcomingAppointments = patientAppointments.filter(a => new Date(a.date) > new Date());
  const pastAppointments = patientAppointments.filter(a => new Date(a.date) <= new Date());

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Moderate': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
              <p className="text-slate-400">Patient ID: #{patient._id.slice(0, 8)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Personal Information
              </h3>
              <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="text-white">{patient.age || 'Not specified'} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="text-white">{patient.dateOfBirth || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-white text-right max-w-[200px]">{patient.address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                Contact Information
              </h3>
              <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Phone:</span>
                  <a href={`tel:${patient.phone}`} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    {patient.phone}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email:</span>
                  <a href={`mailto:${patient.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                    {patient.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Contact:</span>
                  <span className="text-white">{patient.emergencyContact || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="text-white">{patient.emergencyPhone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Medical Information
              </h3>
              <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Risk Profile:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskProfile)}`}>
                    {patient.riskProfile} Risk
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Insurance:</span>
                  <span className="text-white">{patient.insurance || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Visit:</span>
                  <span className="text-white">{patient.lastVisit || 'No previous visits'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Medical History
              </h3>
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <p className="text-slate-300 text-sm leading-relaxed">{patient.medicalHistory || 'No medical history available'}</p>
                {patient.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Notes:</p>
                    <p className="text-slate-300 text-sm">{patient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Appointments ({patientAppointments.length} total)
            </h3>
            
            {upcomingAppointments.length > 0 && (
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="text-emerald-400 font-medium mb-3">Upcoming Appointments</h4>
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 3).map(appt => (
                    <div key={appt._id} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                      <div>
                        <span className="text-white font-medium">{format(new Date(appt.date), 'MMM d, yyyy')}</span>
                        <span className="text-slate-400 ml-2">{format(new Date(appt.date), 'h:mm a')}</span>
                      </div>
                      <span className="text-slate-300 text-sm">{appt.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastAppointments.length > 0 && (
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="text-slate-400 font-medium mb-3">Recent Appointments</h4>
                <div className="space-y-2">
                  {pastAppointments.slice(-3).map(appt => (
                    <div key={appt._id} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                      <div>
                        <span className="text-white font-medium">{format(new Date(appt.date), 'MMM d, yyyy')}</span>
                        <span className="text-slate-400 ml-2">{format(new Date(appt.date), 'h:mm a')}</span>
                      </div>
                      <span className="text-slate-300 text-sm">{appt.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {patientAppointments.length === 0 && (
              <div className="bg-slate-800/50 p-8 rounded-xl text-center">
                <p className="text-slate-400">No appointments found for this patient.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;