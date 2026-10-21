import * as repository from '../repositories/catalogRepository.js';

export const getMascotas = () => repository.listMascotas();
export const getVeterinarios = () => repository.listVeterinarios();
export const getSedes = () => repository.listSedes();
