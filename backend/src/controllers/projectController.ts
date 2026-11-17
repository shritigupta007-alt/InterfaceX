import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project.js';
import { Invitation } from '../models/Invitation.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidators.js';

export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { filter = 'all', search } = req.query;

    let query: any = {};

    if (filter === 'shared') {
      query['collaborators.user'] = userId;
    } else if (filter === 'owned') {
      query.owner = userId;
    } else {
      // 'all' or 'recent'
      query.$or = [{ owner: userId }, { 'collaborators.user': userId }];
    }

    if (search && typeof search === 'string' && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatarColor')
      .populate('collaborators.user', 'name email avatarColor')
      .sort({ updatedAt: -1 })
      .lean();

    // Map projects with user's specific role
    const formatted = projects.map((p: any) => {
      let role = 'VIEWER';
      if (p.owner?._id?.toString() === userId || p.owner?.toString() === userId) {
        role = 'OWNER';
      } else {
        const collab = p.collaborators?.find((c: any) => (c.user?._id || c.user)?.toString() === userId);
        if (collab) role = collab.role;
      }
      return {
        id: p._id.toString(),
        name: p.name,
        owner: p.owner,
        role,
        collaboratorCount: (p.collaborators?.length || 0) + 1,
        componentCount: Array.isArray(p.tree) ? p.tree.length : 0,
        thumbnail: p.thumbnail,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        projects: formatted,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const validated = createProjectSchema.parse(req.body);

    const project = await Project.create({
      name: validated.name || 'Untitled Project',
      owner: userId,
      tree: validated.tree || [],
      collaborators: [],
    });

    const populated = await Project.findById(project._id).populate('owner', 'name email avatarColor');

    res.status(201).json({
      success: true,
      data: {
        project: {
          id: project._id.toString(),
          name: project.name,
          tree: project.tree,
          owner: populated?.owner,
          role: 'OWNER',
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = req.projectDoc;
    const userRole = req.userRole;

    await project.populate('owner', 'name email avatarColor');
    await project.populate('collaborators.user', 'name email avatarColor');

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id.toString(),
          name: project.name,
          tree: project.tree,
          owner: project.owner,
          collaborators: project.collaborators,
          role: userRole,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = req.projectDoc;
    const validated = updateProjectSchema.parse(req.body);

    if (validated.name !== undefined) {
      project.name = validated.name;
    }
    if (validated.tree !== undefined) {
      project.tree = validated.tree;
    }
    if (validated.thumbnail !== undefined) {
      project.thumbnail = validated.thumbnail;
    }

    project.updatedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id.toString(),
          name: project.name,
          tree: project.tree,
          updatedAt: project.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = req.projectDoc;
    const projectId = project._id;

    // Delete associated pending invitations
    await Invitation.deleteMany({ project: projectId });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function duplicateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const source = req.projectDoc;
    const userId = req.user?.userId;

    const copy = await Project.create({
      name: `${source.name} (Copy)`,
      owner: userId,
      tree: source.tree,
      collaborators: [],
    });

    res.status(201).json({
      success: true,
      data: {
        project: {
          id: copy._id.toString(),
          name: copy.name,
          tree: copy.tree,
          role: 'OWNER',
          createdAt: copy.createdAt,
          updatedAt: copy.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
