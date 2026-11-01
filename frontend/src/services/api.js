const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const key = 'lab1bd_session';

export async function api(endpoint, { method = 'GET', body, token } = {}) {
  const headers = {};
  // Si hay un body, le decimos al backend que el formato es JSON
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  // Si hay token de sesión, lo inyectamos
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = {
    method,
    headers,
  };
  // Si pasamos un objeto en el body, lo serializamos a texto JSON automáticamente
  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  let data;
  try {
    data = await response.json();
  } catch (err) {
    // Si la respuesta no es JSON (ej. 204 No Content), no hacemos nada
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
}