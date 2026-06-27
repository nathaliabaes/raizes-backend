const prisma = require('../config/prisma');
const { registrarLog } = require('../utils/auditoria');
const erroHttp = require('../utils/erroHttp');

async function processar(req, res) {
  const { pedidoId, metodo, simularRecusa } = req.body;

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { pagamento: true },
  });

  if (!pedido) return erroHttp(res, 404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado', req.originalUrl);
  if (pedido.pagamento) return erroHttp(res, 409, 'PAGAMENTO_JA_REGISTRADO', 'Pedido já possui pagamento registrado', req.originalUrl);

  if (simularRecusa) {
    const pagamento = await prisma.pagamento.create({
      data: { pedidoId, metodo, valor: pedido.total, status: 'RECUSADO' },
    });
    return res.status(201).json(pagamento);
  }

  // aprovação: registra pagamento e atualiza pedido em uma única transação
  const pagamento = await prisma.$transaction(async (tx) => {
    const pag = await tx.pagamento.create({
      data: { pedidoId, metodo, valor: pedido.total, status: 'APROVADO' },
    });
    await tx.pedido.update({ where: { id: pedidoId }, data: { status: 'PAGO' } });
    return pag;
  });

  await registrarLog(req.usuario.id, 'PAGAMENTO_APROVADO', `pedido #${pedidoId} — ${metodo}`);

  return res.status(201).json(pagamento);
}

module.exports = { processar };
