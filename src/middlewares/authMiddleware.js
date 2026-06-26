const jwt = require('jsonwebtoken');
const erroHttp = require('../utils/erroHttp');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return erroHttp(res, 401, 'TOKEN_AUSENTE', 'Token não fornecido', req.originalUrl);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return erroHttp(res, 401, 'TOKEN_INVALIDO', 'Token inválido ou expirado', req.originalUrl);
  }
}

module.exports = authMiddleware;
