require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// helmet com CSP relaxada para o Swagger UI carregar seus assets
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// bloqueia força bruta no login: máx 10 tentativas por IP a cada 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { erro: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const produtosRoutes = require('./routes/produtosRoutes');
const unidadesRoutes = require('./routes/unidadesRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const pagamentosRoutes = require('./routes/pagamentosRoutes');
const fidelidadeRoutes = require('./routes/fidelidadeRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use('/docs/swagger.json', (req, res) => res.json(swaggerSpec));
app.use('/docs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Raízes do Nordeste — API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: '/docs/swagger.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: 'BaseLayout',
      });
    </script>
  </body>
</html>`);
});

app.use('/auth/login', loginLimiter);
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/produtos', produtosRoutes);
app.use('/unidades', unidadesRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/pagamentos', pagamentosRoutes);
app.use('/fidelidade', fidelidadeRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
