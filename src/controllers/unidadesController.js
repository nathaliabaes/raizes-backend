const prisma = require('../config/prisma');
const erroHttp = require('../utils/erroHttp');

async function listar(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const unidades = await prisma.unidade.findMany({
    where: { ativo: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  return res.json(unidades);
}

async function buscarPorId(req, res) {
  const id = Number(req.params.id);
  const unidade = await prisma.unidade.findUnique({ where: { id } });

  if (!unidade) {
    return erroHttp(res, 404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada', req.originalUrl);
  }

  return res.json(unidade);
}

async function criar(req, res) {
  const { nome, endereco, cidade } = req.body;

  if (!nome || !endereco || !cidade) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', 'nome, endereco e cidade são obrigatórios', req.originalUrl);
  }

  const unidade = await prisma.unidade.create({ data: { nome, endereco, cidade } });
  return res.status(201).json(unidade);
}

async function atualizar(req, res) {
  const id = Number(req.params.id);

  const unidade = await prisma.unidade.findUnique({ where: { id } });
  if (!unidade) return erroHttp(res, 404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada', req.originalUrl);

  const { nome, endereco, cidade } = req.body;
  const atualizada = await prisma.unidade.update({
    where: { id },
    data: { nome, endereco, cidade },
  });

  return res.json(atualizada);
}

module.exports = { listar, buscarPorId, criar, atualizar };
