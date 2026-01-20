import React, { useState } from 'react';
import Button from './Button';
import { db } from '../services/database';

interface LoginFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Verify against database
    setTimeout(() => {
      const admins = db.getAdmins();
      const authenticatedUser = admins.find(a => a.email === email && a.password === password);

      if (authenticatedUser) {
        onSuccess();
      } else {
        setError('Invalid email or password. Hint: admin@gmail.com / 123');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-2xl mb-6 border border-accent/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Access</h2>
        <p className="text-slate-500 mt-2 font-medium">Verify your administrative credentials.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all shadow-sm"
            placeholder="admin@gmail.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all shadow-sm"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-start gap-2 animate-shake">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             {error}
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <Button type="submit" size="lg" isLoading={isLoading} className="w-full py-4 text-lg">
            Authorize Account
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full font-bold">
            Return to Chat
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;