const prisma = require('../config/prisma');
const { registrarLog } = require('../utils/auditoria');
const erroHttp = require('../utils/erroHttp');

const incluirCompleto = {
  itens: { include: { produto: true } },
  pagamento: true,
};

async function criar(req, res) {
  const { usuarioId, unidadeId, canalPedido, itens } = req.body;

  if (!usuarioId || !unidadeId || !canalPedido || !Array.isArray(itens) || itens.length === 0) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', 'usuarioId, unidadeId, canalPedido e itens são obrigatórios', req.originalUrl);
  }

  try {
    // transação garante atomicidade: estoque e pedido são criados juntos ou nenhum é
    const pedido = await prisma.$transaction(async (tx) => {
      let total = 0;
      const validated = [];

      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
        if (!produto) {
          const err = new Error(`Produto ${item.produtoId} não encontrado`);
          err.status = 404;
          err.errorCode = 'PRODUTO_NAO_ENCONTRADO';
          throw err;
        }

        const estoque = await tx.estoque.findUnique({
          where: { unidadeId_produtoId: { unidadeId, produtoId: item.produtoId } },
        });

        if (!estoque || estoque.quantidade < item.quantidade) {
          const err = new Error(`Estoque insuficiente para o produto "${produto.nome}"`);
          err.status = 409;
          err.errorCode = 'ESTOQUE_INSUFICIENTE';
          throw err;
        }

        total += Number(produto.preco) * item.quantidade;
        validated.push({ produtoId: item.produtoId, quantidade: item.quantidade, precoUnit: produto.preco });
      }

      const novo = await tx.pedido.create({
        data: {
          usuarioId,
          unidadeId,
          canalPedido,
          total,
          itens: {
            create: validated.map(({ produtoId, quantidade, precoUnit }) => ({
              produtoId,
              quantidade,
              precoUnit,
            })),
          },
        },
        include: incluirCompleto,
      });

      for (const item of validated) {
        await tx.estoque.update({
          where: { unidadeId_produtoId: { unidadeId, produtoId: item.produtoId } },
          data: { quantidade: { decrement: item.quantidade } },
        });
      }

      return novo;
    });

    await registrarLog(usuarioId, 'CRIAR_PEDIDO', `pedido #${pedido.id} — R$ ${pedido.total}`);

    return res.status(201).json(pedido);
  } catch (err) {
    if (err.status === 409 || err.status === 404) {
      return erroHttp(res, err.status, err.errorCode || 'ERRO_NEGOCIO', err.message, req.originalUrl);
    }
    throw err;
  }
}

async function listar(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const where = { usuarioId: req.usuario.id };
  if (req.query.canalPedido) where.canalPedido = req.query.canalPedido;
  if (req.query.status) where.status = req.query.status;

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: incluirCompleto,
      orderBy: { criadoEm: 'desc' },
      skip,
      take: limit,
    }),
    prisma.pedido.count({ where }),
  ]);

  return res.json({ data: pedidos, total, page, limit });
}

async function buscarPorId(req, res) {
  const id = Number(req.params.id);

  const pedido = await prisma.pedido.findUnique({ where: { id }, include: incluirCompleto });
  if (!pedido) return erroHttp(res, 404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado', req.originalUrl);

  return res.json(pedido);
}

async function atualizarStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) return erroHttp(res, 404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado', req.originalUrl);

  const atualizado = await prisma.pedido.update({
    where: { id },
    data: { status },
    include: incluirCompleto,
  });

  return res.json(atualizado);
}

module.exports = { criar, listar, buscarPorId, atualizarStatus };
