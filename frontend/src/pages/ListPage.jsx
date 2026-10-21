import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function ListPage({ title, endpoint, columns }) {
  const { session, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api(endpoint, { token: session.token })
      .then(data => { if (active) setRows(data); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint, session.token]);

  return <section><h2>{title}</h2>
    {loading ? <p>Cargando…</p> : error ? <p role="alert" className="error">{error} {error.includes('Token') && <button onClick={logout}>Volver a ingresar</button>}</p> :
      rows.length === 0 ? <p>Sin registros.</p> : <div className="table-wrap"><table><thead><tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}>{columns.map(([key]) => <td key={key}>{row[key] ?? '—'}</td>)}</tr>)}</tbody></table></div>}
  </section>;
}
