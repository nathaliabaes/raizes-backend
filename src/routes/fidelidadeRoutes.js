const { Router } = require('express');
const { consultar, adicionarPontos } = require('../controllers/fidelidadeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', consultar);
router.patch('/pontos', roleMiddleware(['ADMIN', 'GERENTE']), adicionarPontos);

module.exports = router;
