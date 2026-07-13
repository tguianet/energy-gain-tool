import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/app/inicio" replace />;
  return <>{children}</>;
}

export function ClienteRoute({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}