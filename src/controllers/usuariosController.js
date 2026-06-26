const prisma = require('../config/prisma');
const erroHttp = require('../utils/erroHttp');

const campos = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  ativo: true,
  criadoEm: true,
};

async function listar(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      select: campos,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { criadoEm: 'desc' },
    }),
    prisma.usuario.count(),
  ]);

  return res.json({ data: usuarios, total, page, limit });
}

async function buscarPorId(req, res) {
  const id = Number(req.params.id);

  const usuario = await prisma.usuario.findUnique({ where: { id }, select: campos });
  if (!usuario) return erroHttp(res, 404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado', req.originalUrl);

  return res.json(usuario);
}

async function atualizar(req, res) {
  const id = Number(req.params.id);
  const { perfil } = req.body;

  const exists = await prisma.usuario.findUnique({ where: { id } });
  if (!exists) return erroHttp(res, 404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado', req.originalUrl);

  const atualizado = await prisma.usuario.update({
    where: { id },
    data: { perfil },
    select: campos,
  });

  return res.json(atualizado);
}

module.exports = { listar, buscarPorId, atualizar };
