const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { registrarLog } = require('../utils/auditoria');
const erroHttp = require('../utils/erroHttp');

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  perfil: z.enum(['ADMIN', 'GERENTE', 'CLIENTE', 'COZINHA', 'ATENDENTE']).optional(),
});

async function register(req, res) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return erroHttp(res, 422, 'DADOS_INVALIDOS', result.error.issues[0].message, req.originalUrl);
  }

  const { nome, email, senha, perfil } = result.data;

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) return erroHttp(res, 409, 'EMAIL_DUPLICADO', 'E-mail já cadastrado', req.originalUrl);

  const hash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: hash, perfil },
    select: { id: true, nome: true, email: true, perfil: true, criadoEm: true },
  });

  await registrarLog(usuario.id, 'REGISTER', `novo usuário: ${email}`);

  return res.status(201).json(usuario);
}

async function login(req, res) {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo) {
    return erroHttp(res, 401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas', req.originalUrl);
  }

  const match = await bcrypt.compare(senha, usuario.senha);
  if (!match) return erroHttp(res, 401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas', req.originalUrl);

  const payload = { id: usuario.id, perfil: usuario.perfil };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  await registrarLog(usuario.id, 'LOGIN', null);

  return res.json({ token, perfil: usuario.perfil, nome: usuario.nome });
}

module.exports = { register, login };
