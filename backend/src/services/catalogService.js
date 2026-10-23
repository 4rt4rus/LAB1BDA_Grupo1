import * as repository from '../repositories/catalogRepository.js';

export const getMascotas = (user) => repository.listMascotas(user.rol === 'TUTOR' ? user.id : null);
export const getMascotaById = (id, user) => repository.findMascotaById(id, user.rol === 'TUTOR' ? user.id : null);

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function positiveId(value) {
  const text = typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : value;
  if (typeof text !== 'string' || !/^[1-9]\d*$/.test(text) || text.length > 19 || BigInt(text) > 9223372036854775807n) {
    throw badRequest('ID de referencia inválido.');
  }
  return text;
}

function validDate(value) {
  if (value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) throw badRequest('Fecha de nacimiento inválida.');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw badRequest('Fecha de nacimiento inválida.');
  return value;
}

function mascotaFields(body, allowed, required) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw badRequest('Se requiere un objeto JSON.');
  const keys = Object.keys(body);
  if (keys.some(key => !allowed.includes(key)) || (!required && keys.length === 0)) throw badRequest('Campos de mascota no permitidos o vacíos.');
  if (required && (!Object.hasOwn(body, 'nombre') || !Object.hasOwn(body, 'especie_id'))) {
    throw badRequest('Nombre y especie_id son obligatorios.');
  }
  const fields = {};
  if (Object.hasOwn(body, 'nombre')) {
    if (typeof body.nombre !== 'string' || !body.nombre.trim()) throw badRequest('Nombre inválido.');
    fields.nombre = body.nombre.trim();
  }
  if (Object.hasOwn(body, 'especie_id')) fields.especie_id = positiveId(body.especie_id);
  if (Object.hasOwn(body, 'fecha_nacimiento')) fields.fecha_nacimiento = validDate(body.fecha_nacimiento);
  if (Object.hasOwn(body, 'sexo')) {
    if (body.sexo !== null && body.sexo !== 'M' && body.sexo !== 'H') throw badRequest('Sexo inválido.');
    fields.sexo = body.sexo;
  }
  return fields;
}

export async function createMascota(body, user) {
  const isAdmin = user.rol === 'ADMINISTRADOR';
  const fields = mascotaFields(body, isAdmin ? ['nombre', 'especie_id', 'fecha_nacimiento', 'sexo', 'tutor_id'] : ['nombre', 'especie_id', 'fecha_nacimiento', 'sexo'], true);
  const tutorId = isAdmin ? positiveId(body.tutor_id) : null;
  const mascota = await repository.insertMascota(fields, isAdmin ? null : user.id, tutorId);
  if (!mascota) throw badRequest('Tutor o especie inexistente.');
  return mascota;
}

export async function updateMascota(id, body, user) {
  const fields = mascotaFields(body, ['nombre', 'especie_id', 'fecha_nacimiento', 'sexo'], false);
  try {
    return await repository.updateMascota(id, fields, user.rol === 'TUTOR' ? user.id : null);
  } catch (error) {
    if (error.code === '23503') throw badRequest('Especie inexistente.');
    throw error;
  }
}

export const getVeterinarios = () => repository.listVeterinarios();
export const getSedes = () => repository.listSedes();
