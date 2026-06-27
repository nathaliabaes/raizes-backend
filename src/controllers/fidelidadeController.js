const prisma = require('../config/prisma');
const erroHttp = require('../utils/erroHttp');

async function consultar(req, res) {
  const { id: usuarioId } = req.usuario;

  const fidelidade = await prisma.fidelidade.upsert({
    where: { usuarioId },
    update: {},
    create: { usuarioId, pontos: 0 },
  });

  return res.json(fidelidade);
}

async function adicionarPontos(req, res) {
  const { usuarioId, pontos } = req.body;

  if (!usuarioId || pontos == null) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', 'usuarioId e pontos são obrigatórios', req.originalUrl);
  }

  const registro = await prisma.fidelidade.upsert({
    where: { usuarioId },
    update: { pontos: { increment: pontos } },
    create: { usuarioId, pontos },
  });

  return res.json(registro);
}

module.exports = { consultar, adicionarPontos };
