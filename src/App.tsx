import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppShell   from '@/components/AppShell';
import Dashboard  from '@/pages/Dashboard';
import Condomini  from '@/pages/Condomini';
import CondominioDetail from '@/pages/CondominioDetail';
import Fornitori  from '@/pages/Fornitori';
import Spese      from '@/pages/Spese';
import Banca      from '@/pages/Banca';
import Consuntivi from '@/pages/Consuntivi';
import Debiti     from '@/pages/Debiti';
import Modulistica from '@/pages/Modulistica';
import Documents  from '@/pages/Documents';
import Templates  from '@/pages/Templates';
import Settings   from '@/pages/Settings';
import Login      from '@/pages/Auth/Login';
import Register   from '@/pages/Auth/Register';
import Onboarding from '@/pages/Auth/Onboarding';
import Legale     from '@/pages/Legale';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton expand={false} />
      <Routes>
        {/* Auth routes (no shell) */}
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App routes (with shell) */}
        <Route path="/" element={<AppShell />}>
          <Route index               element={<Dashboard />} />
          <Route path="condomini"    element={<Condomini />} />
          <Route path="condomini/:id" element={<CondominioDetail />} />
          <Route path="fornitori"    element={<Fornitori />} />
          <Route path="spese"        element={<Spese />} />
          <Route path="banca"        element={<Banca />} />
          <Route path="consuntivi"   element={<Consuntivi />} />
          <Route path="debiti"       element={<Debiti />} />
          <Route path="modulistica"  element={<Modulistica />} />
          <Route path="documenti"    element={<Documents />} />
          <Route path="templates"    element={<Templates />} />
          <Route path="impostazioni" element={<Settings />} />
          <Route path="legale"       element={<Legale />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
