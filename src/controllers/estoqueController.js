const prisma = require('../config/prisma');
const erroHttp = require('../utils/erroHttp');

async function listar(req, res) {
  const unidadeId = req.query.unidadeId ? Number(req.query.unidadeId) : undefined;

  const where = unidadeId ? { unidadeId } : {};

  const estoque = await prisma.estoque.findMany({
    where,
    include: {
      produto: { select: { id: true, nome: true, preco: true } },
      unidade: { select: { id: true, nome: true, cidade: true } },
    },
    orderBy: { unidadeId: 'asc' },
  });

  return res.json(estoque);
}

async function atualizar(req, res) {
  const { unidadeId, produtoId, quantidade } = req.body;

  if (!unidadeId || !produtoId || quantidade == null) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', 'unidadeId, produtoId e quantidade são obrigatórios', req.originalUrl);
  }

  if (quantidade < 0) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', 'quantidade não pode ser negativa', req.originalUrl);
  }

  const registro = await prisma.estoque.upsert({
    where: { unidadeId_produtoId: { unidadeId: Number(unidadeId), produtoId: Number(produtoId) } },
    update: { quantidade: Number(quantidade) },
    create: { unidadeId: Number(unidadeId), produtoId: Number(produtoId), quantidade: Number(quantidade) },
    include: {
      produto: { select: { id: true, nome: true } },
      unidade: { select: { id: true, nome: true } },
    },
  });

  return res.json(registro);
}

module.exports = { listar, atualizar };
