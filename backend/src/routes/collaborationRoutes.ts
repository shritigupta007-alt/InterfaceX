import { Router } from 'express';
import { getMyPendingInvitations, acceptInvitation } from '../controllers/collaborationController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/pending', getMyPendingInvitations);
router.post('/:token/accept', acceptInvitation);

export default router;
