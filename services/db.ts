import { Appointment, Patient, CallLog, AppointmentStatus } from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Data Generator
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const conditions = ['Hypertension', 'Diabetes Type 2', 'Asthma', 'Routine Checkup', 'Migraine', 'Back Pain', 'Flu Symptoms'];

const generateMockPatients = (count: number): Patient[] => {
  return Array.from({ length: count }).map(() => ({
    _id: generateId(),
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    email: `patient${Math.floor(Math.random() * 1000)}@example.com`,
    phone: `+1-555-01${Math.floor(Math.random() * 99)}`,
    riskProfile: Math.random() > 0.8 ? 'High' : Math.random() > 0.5 ? 'Moderate' : 'Low',
  }));
};

const generateMockAppointments = (patients: Patient[], count: number): Appointment[] => {
  const now = new Date();
  return Array.from({ length: count }).map(() => {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const dateOffset = Math.floor(Math.random() * 30) - 5; // -5 to +25 days
    const apptDate = new Date(now);
    apptDate.setDate(now.getDate() + dateOffset);
    apptDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

    return {
      _id: generateId(),
      patientId: patient._id,
      patientName: patient.name,
      date: apptDate.toISOString(),
      durationMinutes: 30,
      status: dateOffset < 0 ? AppointmentStatus.COMPLETED : Math.random() > 0.2 ? AppointmentStatus.SCHEDULED : AppointmentStatus.PENDING,
      type: Math.random() > 0.7 ? 'Check-up' : 'Follow-up',
      notes: `Patient reporting ${conditions[Math.floor(Math.random() * conditions.length)]}.`,
    };
  });
};

class MongoService {
  private static instance: MongoService;
  private readonly PATIENTS_KEY = 'medischedule_patients';
  private readonly APPOINTMENTS_KEY = 'medischedule_appointments';
  private readonly CALLS_KEY = 'medischedule_calls';

  private constructor() {
    this.initialize();
  }

  static getInstance(): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }

  private initialize() {
    if (!localStorage.getItem(this.PATIENTS_KEY)) {
      const patients = generateMockPatients(20);
      const appointments = generateMockAppointments(patients, 50);
      localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
      localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(appointments));
      localStorage.setItem(this.CALLS_KEY, JSON.stringify([]));
    }
  }

  // Simulated MongoDB Collection Methods

  // Patients Collection
  async getPatients(): Promise<Patient[]> {
    return JSON.parse(localStorage.getItem(this.PATIENTS_KEY) || '[]');
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    const patients = await this.getPatients();
    return patients.find(p => p._id === id);
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const patients = await this.getPatients();
    const index = patients.findIndex(p => p._id === id);
    if (index === -1) return null;

    const updated = { ...patients[index], ...updates };
    patients[index] = updated;
    localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
    return updated;
  }

  // Appointments Collection
  async getAppointments(): Promise<Appointment[]> {
    return JSON.parse(localStorage.getItem(this.APPOINTMENTS_KEY) || '[]');
  }

  async insertAppointment(appt: Omit<Appointment, '_id'>): Promise<Appointment> {
    const appointments = await this.getAppointments();
    const newAppt = { ...appt, _id: generateId() };
    appointments.push(newAppt);
    localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(appointments));
    return newAppt;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const appointments = await this.getAppointments();
    const index = appointments.findIndex(a => a._id === id);
    if (index === -1) return null;
    
    const updated = { ...appointments[index], ...updates };
    appointments[index] = updated;
    localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(appointments));
    return updated;
  }

  // Calls Collection
  async insertCallLog(log: Omit<CallLog, '_id'>): Promise<CallLog> {
    const logs = JSON.parse(localStorage.getItem(this.CALLS_KEY) || '[]');
    const newLog = { ...log, _id: generateId() };
    logs.push(newLog);
    localStorage.setItem(this.CALLS_KEY, JSON.stringify(logs));
    return newLog;
  }
  
  async getCallLogs(): Promise<CallLog[]> {
     return JSON.parse(localStorage.getItem(this.CALLS_KEY) || '[]');
  }
}

export const db = MongoService.getInstance();