const { Router } = require('express');
const { listar, atualizar } = require('../controllers/estoqueController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'GERENTE']), listar);
router.patch('/', authMiddleware, roleMiddleware(['ADMIN', 'GERENTE']), atualizar);

module.exports = router;
