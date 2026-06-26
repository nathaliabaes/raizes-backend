const { Router } = require('express');
const { listar, buscarPorId, criar, atualizar } = require('../controllers/unidadesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = Router();

router.get('/', listar);
router.get('/:id', buscarPorId);

router.post('/', authMiddleware, roleMiddleware(['ADMIN']), criar);
router.patch('/:id', authMiddleware, roleMiddleware(['ADMIN']), atualizar);

module.exports = router;
