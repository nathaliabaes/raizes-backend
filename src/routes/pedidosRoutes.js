const { Router } = require('express');
const { criar, listar, buscarPorId, atualizarStatus } = require('../controllers/pedidosController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/', criar);
router.get('/', listar);
router.get('/:id', buscarPorId);
router.patch('/:id/status', roleMiddleware(['ADMIN', 'GERENTE', 'COZINHA']), atualizarStatus);

module.exports = router;
