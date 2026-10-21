import { login } from '../services/authService.js';

export async function postLogin(req, res, next) {
  try {
    res.json(await login(req.body?.correo, req.body?.password));
  } catch (error) {
    next(error);
  }
}
