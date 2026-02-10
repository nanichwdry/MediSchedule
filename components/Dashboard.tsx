import React, { useMemo, useState } from 'react';
import { Appointment, AppointmentStatus, Patient } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { CalendarCheck, Clock, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface DashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  onPatientClick?: (patient: Patient) => void;
  onAppointmentFilter?: (filter: string) => void;
}

interface DashboardProps {
  appointments: Appointment[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; onClick?: () => void }> = ({ title, value, icon: Icon, color, onClick }) => (
  <div 
    className={`bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all ${
      onClick ? 'cursor-pointer hover:scale-105' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ appointments, patients, onPatientClick, onAppointmentFilter }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const pending = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;
    const scheduled = appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length;
    return { total, completed, pending, scheduled };
  }, [appointments]);

  const typeData = useMemo(() => {
    return [
      { name: 'Check-up', value: 32 },
      { name: 'Follow-up', value: 18 }
    ];
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    
    return days.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      
      const dayAppointments = appointments.filter(appt => {
        const apptDate = new Date(appt.date);
        return apptDate.toDateString() === dayDate.toDateString();
      }).length;
      
      return {
        name: day,
        appointments: dayAppointments,
        date: dayDate.toISOString().split('T')[0]
      };
    });
  }, [appointments]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Overview of clinic performance and schedule.</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm border border-emerald-500/20">
             System Operational
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Appointments" 
          value={stats.total.toString()} 
          icon={CalendarCheck} 
          color="bg-emerald-500 text-emerald-500"
          onClick={() => onAppointmentFilter?.('ALL')}
        />
        <StatCard 
          title="Pending Confirmation" 
          value={stats.pending.toString()} 
          icon={Clock} 
          color="bg-amber-500 text-amber-500"
          onClick={() => onAppointmentFilter?.('PENDING')}
        />
        <StatCard 
          title="Active Patients" 
          value={patients.length.toString()} 
          icon={Users} 
          color="bg-blue-500 text-blue-500" 
        />
        <StatCard 
          title="Completed Today" 
          value={stats.completed.toString()} 
          icon={TrendingUp} 
          color="bg-purple-500 text-purple-500"
          onClick={() => onAppointmentFilter?.('COMPLETED')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
          <div className="mb-4 text-sm text-slate-300">
            Data: {weeklyData.map(d => `${d.name}: ${d.appointments}`).join(', ')}
          </div>
          <div className="h-[300px] min-h-[300px] flex items-end justify-between px-4 py-8 gap-2">
            {weeklyData.map((day, index) => (
              <div key={day.name} className="flex flex-col items-center flex-1">
                <div className="text-white text-sm mb-2">{day.appointments}</div>
                <div 
                  className={`w-full rounded-t-md transition-all cursor-pointer ${
                    selectedDay === day.name ? 'bg-cyan-300' : 'bg-cyan-500 hover:bg-cyan-400'
                  }`}
                  style={{ height: `${Math.max((day.appointments / Math.max(...weeklyData.map(d => d.appointments), 1)) * 200, 10)}px` }}
                  title={`${day.name}: ${day.appointments} appointments`}
                  onClick={() => {
                    setSelectedDay(selectedDay === day.name ? null : day.name);
                    if (day.appointments > 0) {
                      onAppointmentFilter?.(day.date);
                    }
                  }}
                ></div>
                <div className="text-white text-sm mt-2">{day.name}</div>
              </div>
            ))}
          </div>
          {selectedDay && (
            <div className="mt-4 p-3 bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-300">
                Showing appointments for {selectedDay}: {weeklyData.find(d => d.name === selectedDay)?.appointments || 0} total
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-6">Appointment Types</h3>
          <div className="h-[300px] min-h-[300px] flex items-center justify-center">
            <div className="relative">
              {/* Simple pie chart representation */}
              <div className="w-48 h-48 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500" style={{clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 64%, 50% 50%)'}}></div>
                <div className="absolute inset-0 bg-blue-500" style={{clipPath: 'polygon(50% 50%, 100% 64%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%)'}}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <button 
              onClick={() => setSelectedType(selectedType === 'Check-up' ? null : 'Check-up')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                selectedType === 'Check-up' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'hover:bg-slate-800'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-300">Check-up (32)</span>
            </button>
            <button 
              onClick={() => setSelectedType(selectedType === 'Follow-up' ? null : 'Follow-up')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                selectedType === 'Follow-up' ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-300">Follow-up (18)</span>
            </button>
          </div>
          {selectedType && (
            <div className="mt-4 p-3 bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-300">
                Showing {selectedType} appointments: {selectedType === 'Check-up' ? '32' : '18'} total
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
