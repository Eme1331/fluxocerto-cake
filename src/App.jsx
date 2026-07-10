import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Componentes from './pages/Componentes';
import ComponenteForm from './pages/ComponenteForm';
import Receitas from './pages/Receitas';
import ReceitaForm from './pages/ReceitaForm';
import Configuracoes from './pages/Configuracoes';
import Pedidos from './pages/Pedidos';
import PedidoForm from './pages/PedidoForm';
import { useStore } from './store/useStore';

const VAR_MAP = {
  primary: '--fc-primary',
  primaryDark: '--fc-primary-dark',
  accent: '--fc-accent',
  bg: '--fc-bg',
};

function App() {
  const tema = useStore((s) => s.tema);

  useEffect(() => {
    Object.entries(tema).forEach(([key, value]) => {
      const varName = VAR_MAP[key];
      if (varName && value) document.documentElement.style.setProperty(varName, value);
    });
  }, [tema]);

  return (
    <HashRouter>
      <div className="app-shell">
        <main className="flex-1 overflow-y-auto scrollbar-none pb-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/componentes" element={<Componentes />} />
            <Route path="/componentes/:tipo/:id" element={<ComponenteForm />} />
            <Route path="/receitas" element={<Receitas />} />
            <Route path="/receitas/:id" element={<ReceitaForm />} />
            <Route path="/config" element={<Configuracoes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/:id" element={<PedidoForm />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default App;
