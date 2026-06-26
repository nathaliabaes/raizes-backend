-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'GERENTE', 'CLIENTE', 'COZINHA', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "CanalPedido" AS ENUM ('APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('APROVADO', 'RECUSADO', 'PENDENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque" (
    "id" SERIAL NOT NULL,
    "unidadeId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "unidadeId" INTEGER NOT NULL,
    "canal" "CanalPedido" NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "total" DECIMAL(10,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnit" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "metodo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelidade" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fidelidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "estoque_unidadeId_produtoId_key" ON "estoque"("unidadeId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_pedidoId_key" ON "pagamentos"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "fidelidade_usuarioId_key" ON "fidelidade"("usuarioId");

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fidelidade" ADD CONSTRAINT "fidelidade_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
