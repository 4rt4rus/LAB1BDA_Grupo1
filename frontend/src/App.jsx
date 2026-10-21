import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ListPage from './pages/ListPage.jsx';
import Login from './pages/Login.jsx';

const views = {
  mascotas: { title: 'Mascotas', endpoint: '/mascotas', columns: [['nombre', 'Nombre'], ['especie', 'Especie'], ['tutor', 'Tutor']] },
  veterinarios: { title: 'Veterinarios', endpoint: '/veterinarios', columns: [['nombre', 'Nombre'], ['registro_profesional', 'Registro'], ['especialidad', 'Especialidad']] },
  sedes: { title: 'Sedes', endpoint: '/sedes', columns: [['nombre', 'Nombre'], ['direccion', 'Dirección'], ['telefono', 'Teléfono']] },
};

export default function App() {
  const { session } = useAuth();
  const [page, setPage] = useState('inicio');
  if (!session) return <Login />;
  return <Layout page={page} setPage={setPage}>{page === 'inicio' ? <Dashboard /> : <ListPage {...views[page]} />}</Layout>;
}
