import React, { useState, useEffect } from 'react';
import Button from './Button';
import { db } from '../services/database';
import { IncidentReport, FeedbackEntry, ChatSession, AdminAccount, EmailLog } from '../types';

interface AdminDashboardProps {
  onManageKB: () => void;
  onAnalyzeChat: () => void;
  messageCount: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onManageKB, onAnalyzeChat, messageCount }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'emails' | 'feedback' | 'history' | 'admins'>('overview');
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);

  // Admin Management State
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setIncidents(db.getIncidents());
    setEmails(db.getEmails());
    setFeedback(db.getFeedback());
    setHistory(db.getHistory());
    setAdmins(db.getAdmins());
  }, [activeTab]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;

    db.saveAdmin({ email: adminEmail, password: adminPassword });
    setAdmins(db.getAdmins());
    setAdminEmail('');
    setAdminPassword('');
    setIsAddingAdmin(false);
    setNotification('Admin successfully added');
  };

  const handleUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminId || !adminEmail) return;

    const updates: Partial<AdminAccount> = { email: adminEmail };
    if (adminPassword) updates.password = adminPassword;

    db.updateAdmin(editingAdminId, updates);
    setAdmins(db.getAdmins());
    setAdminEmail('');
    setAdminPassword('');
    setEditingAdminId(null);
    setNotification('Admin successfully updated');
  };

  const startEdit = (admin: AdminAccount) => {
    setEditingAdminId(admin.id);
    setAdminEmail(admin.email);
    setAdminPassword(''); 
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { id: 'reports', label: 'Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'emails', label: 'Email Outbox', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'feedback', label: 'Feedback', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'admins', label: 'Admins', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500 relative">
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 text-white rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-2 border border-slate-700">
          <div className="bg-green-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          {notification}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Admin Control Center</h2>
          <p className="text-slate-500">Monitor system performance and manage administrative access.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onManageKB} className="shadow-sm">Manage Knowledge Base</Button>
          <Button onClick={onAnalyzeChat} disabled={messageCount < 2} className="shadow-sm">Analyze Session</Button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setIsAddingAdmin(false);
              setEditingAdminId(null);
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-accent text-accent bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Incidents" value={incidents.length} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Emails Sent" value={emails.length} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Feedback" value={feedback.length} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Admins" value={admins.length} color="text-purple-600" bg="bg-purple-50" />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Reporter</th>
                  <th className="px-6 py-4 font-semibold">Summary</th>
                  <th className="px-6 py-4 font-semibold">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {incidents.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No incidents reported yet.</td></tr>
                ) : incidents.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.userName}</td>
                    <td className="px-6 py-4 text-slate-600">{item.summary}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>{item.urgency}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sent Date</th>
                  <th className="px-6 py-4 font-semibold">To (Admin)</th>
                  <th className="px-6 py-4 font-semibold">From (User)</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {emails.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No emails sent yet.</td></tr>
                ) : emails.map(email => (
                  <tr key={email.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{new Date(email.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{email.to}</td>
                    <td className="px-6 py-4 text-slate-600">{email.from}</td>
                    <td className="px-6 py-4 text-slate-600 italic truncate max-w-[200px]">{email.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold">Content Rated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {feedback.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No feedback received.</td></tr>
                ) : feedback.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold">
                      {item.type === 'positive' ? <span className="text-green-600">Helpful</span> : <span className="text-red-600">Not Helpful</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md truncate italic">"{item.messageContent}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8">
            <div className="flex flex-col gap-3">
               {history.length === 0 ? (
                 <p className="text-center text-slate-400 py-12 italic">No session history found.</p>
               ) : history.map(session => (
                 <div key={session.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50 hover:border-accent transition-all cursor-pointer group">
                    <div className="flex justify-between items-center">
                       <span className="font-bold text-slate-800 group-hover:text-accent">Session: {session.id.split('-')[1]}</span>
                       <span className="text-xs text-slate-500">{new Date(session.timestamp).toLocaleString()}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Admin Accounts</h3>
                  <p className="text-sm text-slate-500">Manage individuals with access to this dashboard.</p>
               </div>
               {!isAddingAdmin && !editingAdminId && (
                 <Button onClick={() => setIsAddingAdmin(true)} className="gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Account
                 </Button>
               )}
            </div>

            {(isAddingAdmin || editingAdminId) && (
              <div className="mb-10 p-8 bg-slate-50 rounded-2xl border border-slate-200 animate-in zoom-in duration-200 shadow-inner">
                <form onSubmit={editingAdminId ? handleUpdateAdmin : handleAddAdmin} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={e => setAdminEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent outline-none bg-white shadow-sm"
                        placeholder="admin@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                      <input
                        type="password"
                        required={!editingAdminId}
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent outline-none bg-white shadow-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={() => { setIsAddingAdmin(false); setEditingAdminId(null); setAdminEmail(''); setAdminPassword(''); }}>Cancel</Button>
                    <Button type="submit">
                      {editingAdminId ? 'Update Account' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {admins.map(admin => (
                 <div key={admin.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-accent transition-colors">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-xl border border-accent/20">
                            {admin.email[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-slate-900 truncate" title={admin.email}>{admin.email}</h4>
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 uppercase tracking-tighter">{admin.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                      <button onClick={() => startEdit(admin)} className="text-sm font-bold text-accent hover:underline">Edit</button>
                      <button 
                        onClick={() => { if(confirm('Delete this admin account?')) { db.deleteAdmin(admin.id); setAdmins(db.getAdmins()); setNotification('Admin deleted'); } }}
                        className="text-sm font-bold text-red-500 hover:text-red-700 ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, bg }: { label: string, value: number, color: string, bg: string }) => (
  <div className={`p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center ${bg}`}>
    <span className={`text-5xl font-black mb-1 ${color}`}>{value}</span>
    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

export default AdminDashboard;