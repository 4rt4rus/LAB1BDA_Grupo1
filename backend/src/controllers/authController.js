import { getCurrentUser, login } from '../services/authService.js';

export async function postLogin(req, res, next) {
  try {
    res.json(await login(req.body?.correo, req.body?.password));
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json(await getCurrentUser(req.user.id));
  } catch (error) {
    next(error);
  }
}
