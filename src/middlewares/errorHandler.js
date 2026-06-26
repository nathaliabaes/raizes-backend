function errorHandler(err, req, res, next) {
  console.error(err);

  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'REGISTRO_DUPLICADO', message: 'Registro duplicado', details: [], timestamp, path });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'REGISTRO_NAO_ENCONTRADO', message: 'Registro não encontrado', details: [], timestamp, path });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Erro interno no servidor';

  return res.status(status).json({
    error: status < 500 ? 'ERRO_REQUISICAO' : 'ERRO_INTERNO',
    message,
    details: [],
    timestamp,
    path,
  });
}

module.exports = errorHandler;
