import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from '@/contexts/DataContext';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientesPage from '@/pages/ClientesPage';
import SimuladorPage from '@/pages/SimuladorPage';
import PropostasPage from '@/pages/PropostasPage';
import ContratosPage from '@/pages/ContratosPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LoginPage onLogin={() => setLoggedIn(true)} />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DataProvider>
          <BrowserRouter>
            <AppLayout onLogout={() => setLoggedIn(false)}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/simulador" element={<SimuladorPage />} />
                <Route path="/propostas" element={<PropostasPage />} />
                <Route path="/contratos" element={<ContratosPage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
