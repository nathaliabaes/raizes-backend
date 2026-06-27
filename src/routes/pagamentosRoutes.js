const { Router } = require('express');
const { processar } = require('../controllers/pagamentosController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', authMiddleware, processar);

module.exports = router;
