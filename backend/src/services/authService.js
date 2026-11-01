import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById } from '../repositories/authRepository.js';

export async function getCurrentUser(id) {
  const user = await findUserById(id);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.status = 404;
    throw error;
  }
  if (!user.activo) {
    const error = new Error('Cuenta inactiva.');
    error.status = 401;
    throw error;
  }
  return { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
}

export async function login(correo, password) {
  if (typeof correo !== 'string' || typeof password !== 'string' || !correo.trim() || !password) {
    const error = new Error('Correo y contraseña son obligatorios.');
    error.status = 400;
    throw error;
  }
  const user = await findUserByEmail(correo.trim());
  if (!user?.activo || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error('Credenciales incorrectas.');
    error.status = 401;
    throw error;
  }
  const payload = { sub: String(user.id), rol: user.rol };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  return { token, usuario: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } };
}
