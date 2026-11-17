import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  duplicateProject,
} from '../controllers/projectController.js';
import {
  getCollaborators,
  createInvitation,
  removeCollaborator,
} from '../controllers/collaborationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeProject } from '../middleware/authorize.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);

router.get('/:id', authorizeProject(['OWNER', 'EDITOR', 'VIEWER']), getProjectById);
router.put('/:id', authorizeProject(['OWNER', 'EDITOR']), updateProject);
router.delete('/:id', authorizeProject(['OWNER']), deleteProject);
router.post('/:id/duplicate', authorizeProject(['OWNER', 'EDITOR', 'VIEWER']), duplicateProject);

// Collaborator sub-routes
router.get('/:id/collaborators', authorizeProject(['OWNER', 'EDITOR', 'VIEWER']), getCollaborators);
router.post('/:id/invitations', authorizeProject(['OWNER']), createInvitation);
router.delete('/:id/collaborators/:userId', authorizeProject(['OWNER', 'EDITOR', 'VIEWER']), removeCollaborator);

export default router;
