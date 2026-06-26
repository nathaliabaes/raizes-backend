const erroHttp = require('../utils/erroHttp');

function roleMiddleware(perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return erroHttp(res, 403, 'ACESSO_NEGADO', 'Acesso negado', req.originalUrl);
    }
    next();
  };
}

module.exports = roleMiddleware;
