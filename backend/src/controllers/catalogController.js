import * as service from '../services/catalogService.js';

function list(handler) {
  return async (_req, res, next) => {
    try { res.json(await handler()); } catch (error) { next(error); }
  };
}

export const getMascotas = list(service.getMascotas);
export const getVeterinarios = list(service.getVeterinarios);
export const getSedes = list(service.getSedes);
