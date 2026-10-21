import { useAuth } from '../context/AuthContext.jsx';

const links = [
  ['inicio', 'Inicio'], ['mascotas', 'Mascotas'],
  ['veterinarios', 'Veterinarios'], ['sedes', 'Sedes'],
];

export default function Layout({ page, setPage, children }) {
  const { session, logout } = useAuth();
  return <div className="shell">
    <header><h1>Red Veterinaria</h1><span>{session.usuario.nombre} · {session.usuario.rol}</span><button onClick={logout}>Salir</button></header>
    <nav>{links.map(([id, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>{label}</button>)}</nav>
    <main>{children}</main>
  </div>;
}
