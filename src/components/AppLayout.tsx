import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calculator, FileText, FileCheck,
  BarChart3, Settings, ChevronLeft, ChevronRight, Zap, LogOut, Menu, X, UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Clientes', icon: Users, path: '/clientes' },
  { label: 'Simulador', icon: Calculator, path: '/simulador' },
  { label: 'Propostas', icon: FileText, path: '/propostas' },
  { label: 'Contratos', icon: FileCheck, path: '/contratos' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AppLayout({ children, onLogout }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col gradient-sidebar transition-all duration-300 md:relative',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-energy">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">
              EnergiaSub
            </span>
          )}
          <button
            className="ml-auto text-sidebar-foreground md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-sidebar-accent text-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center rounded-lg py-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="flex h-14 items-center border-b px-4 md:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">EnergiaSub</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
