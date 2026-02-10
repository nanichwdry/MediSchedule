import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { format } from 'date-fns';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ScheduleProps {
  appointments: Appointment[];
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ appointments, onStatusChange }) => {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = appointments.filter(a => {
    const matchesFilter = filter === 'ALL' || a.status === filter;
    const matchesSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || 
                          a.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case AppointmentStatus.COMPLETED: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case AppointmentStatus.CANCELLED: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case AppointmentStatus.PENDING: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
          <p className="text-slate-400">Manage patient appointments and timeline.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20">
                + New Appointment
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search patients or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['ALL', 'SCHEDULED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === s 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Time & Date</th>
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{format(new Date(appt.date), 'MMM d, yyyy')}</span>
                      <span className="text-slate-500 text-sm">{format(new Date(appt.date), 'h:mm a')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {appt.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-slate-200 font-medium">{appt.patientName}</div>
                        <div className="text-slate-500 text-xs">ID: #{appt.patientId.slice(0, 6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300">{appt.type}</span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {appt.durationMinutes} min
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {appt.status === AppointmentStatus.PENDING && (
                        <>
                          <button 
                            onClick={() => onStatusChange(appt._id, AppointmentStatus.SCHEDULED)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => onStatusChange(appt._id, AppointmentStatus.CANCELLED)}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Decline"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
