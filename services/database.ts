import { IncidentReport, FeedbackEntry, ChatSession, AdminAccount, EmailLog } from '../types';

const STORAGE_KEYS = {
  INCIDENTS: 'it_bot_incidents',
  FEEDBACK: 'it_bot_feedback',
  HISTORY: 'it_bot_history',
  ADMINS: 'it_bot_admins',
  EMAILS: 'it_bot_emails',
};

// Seed default admin if none exists
if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([{
    id: '1',
    email: 'admin@gmail.com',
    password: '123',
    role: 'Super Admin',
    createdAt: new Date().toISOString()
  }]));
}

export const db = {
  // Incidents
  getIncidents: (): IncidentReport[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTS) || '[]'),
  saveIncident: (incident: Omit<IncidentReport, 'id' | 'timestamp'>) => {
    const incidents = db.getIncidents();
    const newIncident: IncidentReport = {
      ...incident,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify([newIncident, ...incidents]));
    return newIncident;
  },

  // Email Logs
  getEmails: (): EmailLog[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EMAILS) || '[]'),
  saveEmail: (log: Omit<EmailLog, 'id' | 'timestamp'>) => {
    const emails = db.getEmails();
    const newEmail: EmailLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify([newEmail, ...emails]));
    return newEmail;
  },

  // Feedback
  getFeedback: (): FeedbackEntry[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || '[]'),
  saveFeedback: (feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>) => {
    const entries = db.getFeedback();
    const newEntry: FeedbackEntry = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify([newEntry, ...entries]));
    return newEntry;
  },

  // History
  getHistory: (): ChatSession[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]'),
  saveChatSession: (session: ChatSession) => {
    const history = db.getHistory();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([session, ...history]));
  },

  // Admins
  getAdmins: (): AdminAccount[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]'),
  
  saveAdmin: (admin: Omit<AdminAccount, 'id' | 'createdAt' | 'role'>) => {
    const admins = db.getAdmins();
    const newAdmin: AdminAccount = {
      ...admin,
      id: Math.random().toString(36).substr(2, 9),
      role: 'Admin',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([...admins, newAdmin]));
    return newAdmin;
  },

  updateAdmin: (id: string, updates: Partial<AdminAccount>) => {
    const admins = db.getAdmins();
    const updated = admins.map(a => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(updated));
  },

  deleteAdmin: (id: string) => {
    const admins = db.getAdmins();
    const filtered = admins.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered));
  }
};