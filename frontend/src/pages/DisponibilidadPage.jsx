import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function DisponibilidadPage() {
  const { session } = useAuth();
  const [veterinarios, setVeterinarios] = useState([]);
  const [idVeterinario, setIdVeterinario] = useState('');
  const [fecha, setFecha] = useState('');
  const [bloques, setBloques] = useState([]);
  const [consultado, setConsultado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carga los veterinarios existentes para el selector
  useEffect(() => {
    api('/veterinarios', { token: session.token })
      .then((data) => {
        setVeterinarios(data);
        if (data.length > 0) setIdVeterinario(String(data[0].id));
      })
      .catch((e) => setError(e.message));
  }, [session.token]);

  const consultarBloques = async (e) => {
    e.preventDefault();
    if (!idVeterinario || !fecha.trim()) return;
    setLoading(true);
    setError('');
    setConsultado(false);
    try {
      const data = await api(
        `/veterinarios/${idVeterinario}/disponibilidad?fecha=${encodeURIComponent(fecha.trim())}`,
        { token: session.token }
      );
      setBloques(data);
      setConsultado(true);
    } catch (err) {
      setError(err.message);
      setBloques([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Disponibilidad Horaria de Veterinarios</h2>

      <form
        onSubmit={consultarBloques}
        style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap' }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Veterinario:</span>
          <select
            value={idVeterinario}
            onChange={(e) => setIdVeterinario(e.target.value)}
            required
          >
            {veterinarios.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre} ({v.sede})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Fecha (YYYY-MM-DD):</span>
          <input
            type="text"
            placeholder="Ej: 2026-11-25"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Calculando…' : 'Calcular bloques disponibles'}
        </button>
      </form>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {consultado && !error && (
        bloques.length === 0 ? (
          <p>No hay bloques disponibles para esta fecha.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hora Disponible</th>
                  <th>Fecha y Hora Exacta</th>
                </tr>
              </thead>
              <tbody>
                {bloques.map((b, i) => (
                  <tr key={b.hora_disponible ?? i}>
                    <td>{b.hora_disponible} hrs</td>
                    <td>{b.fecha_hora_exacta ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
}