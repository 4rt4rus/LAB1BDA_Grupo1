import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const match = /^Bearer (.+)$/i.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ error: 'Token requerido.' });
  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET);
    req.user = {
      id: Number(decoded.sub),
      rol: decoded.rol,
      id_tutor: decoded.id_tutor,
      id_veterinario: decoded.id_veterinario,
      id_sede: decoded.id_sede,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o vencido.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.rol)) return res.status(403).json({ error: 'Acceso denegado.' });
    next();
  };
}