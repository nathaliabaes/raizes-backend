const prisma = require('../config/prisma');
const erroHttp = require('../utils/erroHttp');

async function listar(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);

  const [produtos, total] = await Promise.all([
    prisma.produto.findMany({
      where: { ativo: true },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.produto.count({ where: { ativo: true } }),
  ]);

  return res.json({ data: produtos, total, page, limit });
}

async function buscarPorId(req, res) {
  const { id: rawId } = req.params;
  const produto = await prisma.produto.findUnique({ where: { id: Number(rawId) } });

  if (!produto) return erroHttp(res, 404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado', req.originalUrl);
  return res.json(produto);
}

async function criar(req, res) {
  const { nome, descricao, preco } = req.body;

  if (!nome || preco == null) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', 'nome e preco são obrigatórios', req.originalUrl);
  }

  const produto = await prisma.produto.create({ data: { nome, descricao, preco } });
  return res.status(201).json(produto);
}

async function atualizar(req, res) {
  const id = Number(req.params.id);

  const found = await prisma.produto.findUnique({ where: { id } });
  if (!found) return erroHttp(res, 404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado', req.originalUrl);

  const { nome, descricao, preco } = req.body;
  const atualizado = await prisma.produto.update({ where: { id }, data: { nome, descricao, preco } });
  return res.json(atualizado);
}

module.exports = { listar, buscarPorId, criar, atualizar };
