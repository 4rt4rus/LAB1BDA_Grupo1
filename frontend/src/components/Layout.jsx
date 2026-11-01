import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  ['inicio', 'Inicio', ['Administrador', 'Veterinario', 'Tutor']], 
  ['mascotas', 'Mascotas', ['Administrador', 'Veterinario', 'Tutor']],
  ['citas', 'Citas Médicas', ['Administrador', 'Veterinario', 'Tutor']],
  ['veterinarios', 'Veterinarios', ['Administrador']],
  ['disponibilidad', 'Disponibilidad Horaria', ['Administrador']],
  ['sedes', 'Sedes', ['Administrador']],
  ['fichas', 'Fichas Clínicas', ['Administrador', 'Veterinario', 'Tutor']],
  ['vacunaciones', 'Vacunas', ['Administrador', 'Veterinario', 'Tutor']],
  ['inventario', 'Inventario', ['Administrador']],
  ['auditoria', 'Auditoría', ['Administrador']],
  ['estadisticas', 'Estadísticas (MV)', ['Administrador']],
];

export default function Layout({ page, setPage, children }) {
  const { session, logout } = useAuth();
  const rolUsuario = session.usuario.rol;
  const linksVisibles = links.filter(([, , rolesPermitidos]) =>
    rolesPermitidos.includes(rolUsuario)
  );
  
  return (
    <div className="shell">
      <header>
        <h1>Red Veterinaria</h1>
        <span>{session.usuario.nombre} · {rolUsuario}</span>
        <button onClick={logout}>Salir</button>
      </header>
      <nav>
        {linksVisibles.map(([id, label]) => (
          <button
            key={id}
            className={page === id ? 'active' : ''}
            onClick={() => setPage(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <main>{children}</main>
    </div>
  );
}