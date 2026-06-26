const prisma = require('../config/prisma');

async function registrarLog(usuarioId, acao, detalhes) {
  try {
    await prisma.logAuditoria.create({
      data: { usuarioId: usuarioId || null, acao, detalhes },
    });
  } catch {
    // falha no log não pode quebrar a operação que o chamou
  }
}

module.exports = { registrarLog };
