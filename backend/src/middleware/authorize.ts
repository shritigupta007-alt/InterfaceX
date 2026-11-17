import { Request, Response, NextFunction } from 'express';
import { Project, ProjectRole } from '../models/Project.js';
import mongoose from 'mongoose';

export function authorizeProject(allowedRoles: ProjectRole[] = ['OWNER', 'EDITOR', 'VIEWER']) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid project ID format' });
        return;
      }

      const project = await Project.findById(id);
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      // Check role
      let role: ProjectRole | null = null;
      if (project.owner.toString() === userId) {
        role = 'OWNER';
      } else {
        const collab = project.collaborators.find((c) => c.user.toString() === userId);
        if (collab) {
          role = collab.role;
        }
      }

      if (!role) {
        res.status(403).json({ success: false, error: 'You do not have access to this project.' });
        return;
      }

      if (!allowedRoles.includes(role)) {
        res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required: ${allowedRoles.join(' or ')}. Your role: ${role}`,
        });
        return;
      }

      req.projectDoc = project;
      req.userRole = role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
