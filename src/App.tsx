import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useSite } from './contexts/SiteContext';
import type { SectionKey } from './types';
import Home from './pages/Home';
import Research from './pages/Research';
import Publications from './pages/Publications';
import Awards from './pages/Awards';
import Teaching from './pages/Teaching';
import Contact from './pages/Contact';
import Portal from './admin/Portal';

function Gate({ section, children }: { section: SectionKey; children: ReactNode }) {
  const { settings } = useSite();
  if (settings.hidden_sections.includes(section)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={<Gate section="research"><Research /></Gate>} />
        <Route path="publications" element={<Gate section="publications"><Publications /></Gate>} />
        <Route path="awards" element={<Gate section="awards"><Awards /></Gate>} />
        <Route path="teaching" element={<Gate section="teaching"><Teaching /></Gate>} />
        <Route path="contact" element={<Contact />} />
        <Route path="scholar-desk" element={<Portal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
