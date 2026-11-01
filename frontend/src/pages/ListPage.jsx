import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function ListPage({ title, endpoint, columns, filterConfig, renderActions, topContent }) {
  const { session, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [useFilter, setUseFilter] = useState(false);

  useEffect(() => {
    setUseFilter(false);
  }, [endpoint]);

  const activeEndpoint = useFilter && filterConfig ? filterConfig.endpoint : endpoint;

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    api(activeEndpoint, { token: session.token })
      .then(data => setRows(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeEndpoint, session.token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{useFilter && filterConfig?.title ? filterConfig.title : title}</h2>
        {filterConfig && (!filterConfig.roles || filterConfig.roles.includes(session.usuario.rol)) && (
          <button onClick={() => setUseFilter(!useFilter)}>
            {useFilter ? filterConfig.clearLabel : filterConfig.buttonLabel}
          </button>
        )}
      </div>

      {/* Espacio opcional para formularios de creación arriba de la tabla */}
      {topContent && topContent(loadData, session)}

      {loading ? (
        <p>Cargando…</p>
      ) : error ? (
        <p role="alert" className="error">
          {error} {error.includes('Token') && <button onClick={logout}>Volver a ingresar</button>}
        </p>
      ) : rows.length === 0 ? (
        <p>Sin registros.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
                {renderActions && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map(([key, , render]) => (
                    <td key={key}>
                      {render ? render(row[key], row) : (row[key] ?? '—')}
                    </td>
                  ))}
                  {renderActions && (
                    <td>{renderActions(row, loadData, session)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}