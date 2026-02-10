import { Appointment, Patient, CallLog, AppointmentStatus } from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Data Generator
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
  'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy'
];
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];
const conditions = [
  'Hypertension', 'Diabetes Type 2', 'Asthma', 'Routine Checkup', 'Migraine', 'Back Pain', 'Flu Symptoms',
  'Arthritis', 'High Cholesterol', 'Anxiety', 'Depression', 'Allergies', 'Insomnia', 'COPD',
  'Heart Disease', 'Osteoporosis', 'Thyroid Issues', 'Kidney Disease', 'Liver Disease', 'Cancer Screening'
];
const medicalHistory = [
  'No significant medical history', 'History of heart disease', 'Family history of diabetes',
  'Previous surgery in 2019', 'Chronic pain management', 'Medication allergies noted',
  'Regular blood pressure monitoring', 'Diabetic - insulin dependent', 'Asthma - uses inhaler',
  'Previous hospitalization', 'Ongoing physical therapy', 'Mental health treatment'
];
const insuranceProviders = [
  'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Kaiser Permanente',
  'Anthem', 'Medicare', 'Medicaid', 'Tricare', 'Independence Blue Cross', 'Molina Healthcare'
];

const generateMockPatients = (count: number): Patient[] => {
  return Array.from({ length: count }).map((_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const age = 18 + Math.floor(Math.random() * 70);
    const phoneNumber = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    
    return {
      _id: generateId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@email.com`,
      phone: phoneNumber,
      age,
      dateOfBirth: `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Maple Ln', 'Cedar Way', 'Park Blvd', 'First Ave', 'Second St', 'Third Dr'][Math.floor(Math.random() * 10)]}, ${['Springfield', 'Franklin', 'Georgetown', 'Madison', 'Clinton', 'Riverside', 'Fairview', 'Midtown', 'Downtown', 'Uptown'][Math.floor(Math.random() * 10)]}, ${['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'][Math.floor(Math.random() * 10)]} ${Math.floor(Math.random() * 90000) + 10000}`,
      insurance: insuranceProviders[Math.floor(Math.random() * insuranceProviders.length)],
      emergencyContact: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
      emergencyPhone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      medicalHistory: medicalHistory[Math.floor(Math.random() * medicalHistory.length)],
      lastVisit: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      riskProfile: Math.random() > 0.8 ? 'High' : Math.random() > 0.5 ? 'Moderate' : 'Low',
      notes: Math.random() > 0.5 ? `Patient is ${['cooperative and follows instructions well', 'anxious about medical procedures', 'punctual and reliable', 'requires assistance with mobility', 'prefers morning appointments', 'has transportation challenges', 'very health-conscious', 'needs interpreter services'][Math.floor(Math.random() * 8)]}` : undefined,
    };
  });
};

const generateMockAppointments = (patients: Patient[], count: number): Appointment[] => {
  const now = new Date();
  return Array.from({ length: count }).map(() => {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const dateOffset = Math.floor(Math.random() * 60) - 15; // -15 to +45 days
    const apptDate = new Date(now);
    apptDate.setDate(now.getDate() + dateOffset);
    apptDate.setHours(8 + Math.floor(Math.random() * 10), [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);

    const appointmentTypes = ['Check-up', 'Follow-up', 'Consultation', 'Emergency'];
    const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
    
    let status: AppointmentStatus;
    if (dateOffset < -1) {
      status = AppointmentStatus.COMPLETED;
    } else if (dateOffset < 0) {
      status = Math.random() > 0.5 ? AppointmentStatus.COMPLETED : AppointmentStatus.CANCELLED;
    } else {
      status = Math.random() > 0.2 ? AppointmentStatus.SCHEDULED : AppointmentStatus.PENDING;
    }

    const conditionForAppt = conditions[Math.floor(Math.random() * conditions.length)];
    const notes = [
      `Patient reporting ${conditionForAppt.toLowerCase()}`,
      `Follow-up for ${conditionForAppt.toLowerCase()}`,
      `Routine ${appointmentType.toLowerCase()} - ${conditionForAppt.toLowerCase()}`,
      `Patient experiencing symptoms related to ${conditionForAppt.toLowerCase()}`,
      `Scheduled ${appointmentType.toLowerCase()} for ${conditionForAppt.toLowerCase()} management`
    ];

    return {
      _id: generateId(),
      patientId: patient._id,
      patientName: patient.name,
      date: apptDate.toISOString(),
      durationMinutes: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
      status,
      type: appointmentType as 'Check-up' | 'Follow-up' | 'Emergency' | 'Consultation',
      notes: notes[Math.floor(Math.random() * notes.length)],
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
    // Always regenerate data for now to ensure realistic data
    this.generateFreshData();
  }

  generateFreshData() {
    console.log('Generating fresh realistic patient data...');
    const patients = generateMockPatients(50);
    console.log('Sample patient:', patients[0]);
    const appointments = generateMockAppointments(patients, 120);
    localStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
    localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(appointments));
    localStorage.setItem(this.CALLS_KEY, JSON.stringify([]));
    console.log(`Generated ${patients.length} patients and ${appointments.length} appointments`);
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