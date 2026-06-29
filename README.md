# Raízes do Nordeste — API REST

API de gestão da rede de lanchonetes Raízes do Nordeste.

**Repositório:** https://github.com/nathaliabaes/raizes-backend

---

## Requisitos

- Node.js 18 ou superior
- PostgreSQL (ou conta no Supabase)
- Principais dependências: Express 5, Prisma 6, JWT, bcryptjs

---

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar o .env com a DATABASE_URL e JWT_SECRET

# 3. Aplicar migrations no banco
npx prisma migrate deploy

# 4. Gerar o Prisma Client
npx prisma generate

# 5. Popular o banco com dados iniciais (seed)
npx prisma db seed

# 6. Subir o servidor
npm run dev
```

Servidor disponível em `http://localhost:3000`

---

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_do_banco"
JWT_SECRET="sua_chave_secreta"
PORT=3000
```

---

## Documentação (Swagger)

Acesse `http://localhost:3000/docs` com o servidor rodando.

---

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| `ADMIN` | Acesso total |
| `GERENTE` | Produtos, pedidos, fidelidade |
| `COZINHA` | Atualização de status dos pedidos |
| `ATENDENTE` | Acesso operacional |
| `CLIENTE` | Próprios pedidos e fidelidade |

Rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

---

## Testes

A coleção completa está no arquivo `raizes-collection.postman_collection.json`. Importe no Postman para executar todos os cenários.

### Como executar

1. Importe o arquivo `raizes-collection.postman_collection.json` no Postman
2. Execute **Auth → Login** e copie o token retornado
3. Cole o token na variável `{{token}}` do ambiente (ou substitua diretamente nas requisições)
4. Siga a ordem: Auth → Usuários → Produtos → Unidades → Estoque → Pedidos → Pagamentos → Fidelidade
5. Para testar erros, use a pasta **Erros** — não requer ordem específica

> O banco já possui dados de seed (produtos, unidade e usuário admin). Para testar pedidos, o estoque está pré-populado com 30 unidades por produto.

### Cenários cobertos

| # | Cenário | Método | Rota | Esperado |
|---|---|---|---|---|
| T01 | Login com credenciais válidas | `POST` | `/auth/login` | `200` + token |
| T02 | Acesso sem token | `GET` | `/usuarios` | `401` |
| T03 | Criar pedido com `canalPedido: APP` | `POST` | `/pedidos` | `201` |
| T04 | Criar pedido sem campos obrigatórios | `POST` | `/pedidos` | `422` |
| T05 | Pedido com estoque insuficiente | `POST` | `/pedidos` | `409` |
| T06 | Pagamento aprovado | `POST` | `/pagamentos` | `201` + `APROVADO` |
| T07 | Pagamento recusado (`simularRecusa: true`) | `POST` | `/pagamentos` | `201` + `RECUSADO` |
| T08 | Listar produtos | `GET` | `/produtos` | `200` + lista |
| T09 | Perfil sem permissão | `GET` | `/usuarios` | `403` |
| T10 | Consultar fidelidade | `GET` | `/fidelidade` | `200` + pontos |
| T11 | Login com senha incorreta | `POST` | `/auth/login` | `401` |
| T12 | Produto inexistente | `GET` | `/produtos/9999` | `404` |
| T13 | Consultar estoque por unidade | `GET` | `/estoque?unidadeId=1` | `200` + lista |
| T14 | Atualizar quantidade em estoque | `PATCH` | `/estoque` | `200` + registro atualizado |

---


