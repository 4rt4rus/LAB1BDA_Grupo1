import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('ana@example.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(correo, password); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return <main className="login"><h1>Red Veterinaria</h1><p>Ingresa para ver los datos de demostración.</p>
    <form onSubmit={submit}>
      <label>Correo<input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required /></label>
      <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  </main>;
}
