import * as service from '../services/catalogService.js';

function list(handler) {
  return async (req, res, next) => {
    try { res.json(await handler(req.user)); } catch (error) { next(error); }
  };
}

export const getMascotas = list(service.getMascotas);

function validMascotaId(id) {
  return /^[1-9]\d*$/.test(id) && id.length <= 19 && BigInt(id) <= 9223372036854775807n;
}

export async function getMascotaById(req, res, next) {
  const { id } = req.params;
  if (!validMascotaId(id)) {
    return res.status(400).json({ error: 'ID de mascota inválido.' });
  }
  try {
    const mascota = await service.getMascotaById(id, req.user);
    if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada.' });
    res.json(mascota);
  } catch (error) {
    next(error);
  }
}

export async function postMascota(req, res, next) {
  try {
    res.status(201).json(await service.createMascota(req.body, req.user));
  } catch (error) {
    next(error);
  }
}

export async function patchMascota(req, res, next) {
  const { id } = req.params;
  if (!validMascotaId(id)) return res.status(400).json({ error: 'ID de mascota inválido.' });
  try {
    const mascota = await service.updateMascota(id, req.body, req.user);
    if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada.' });
    res.json(mascota);
  } catch (error) {
    next(error);
  }
}

export const getVeterinarios = list(service.getVeterinarios);
export const getSedes = list(service.getSedes);
