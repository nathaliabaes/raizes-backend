const { Router } = require('express');
const { listar, buscarPorId, atualizar } = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN']));

router.get('/', listar);
router.get('/:id', buscarPorId);
router.patch('/:id', atualizar);

module.exports = router;
