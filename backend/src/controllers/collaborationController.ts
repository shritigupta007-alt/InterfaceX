import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Invitation } from '../models/Invitation.js';
import { inviteCollaboratorSchema } from '../validators/projectValidators.js';

export async function getCollaborators(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = req.projectDoc;
    await project.populate('owner', 'name email avatarColor');
    await project.populate('collaborators.user', 'name email avatarColor');

    const collaborators = [
      {
        user: project.owner,
        role: 'OWNER',
        isOwner: true,
      },
      ...project.collaborators.map((c: any) => ({
        user: c.user,
        role: c.role,
        addedAt: c.addedAt,
        isOwner: false,
      })),
    ];

    // Also fetch pending invitations if owner/editor
    let pendingInvitations: any[] = [];
    if (req.userRole === 'OWNER') {
      pendingInvitations = await Invitation.find({
        project: project._id,
        status: 'PENDING',
        expiresAt: { $gt: new Date() },
      }).lean();
    }

    res.status(200).json({
      success: true,
      data: {
        collaborators,
        pendingInvitations,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = req.projectDoc;
    const inviterId = req.user?.userId;
    const validated = inviteCollaboratorSchema.parse(req.body);

    // Prevent inviting self
    if (validated.email === req.user?.email) {
      res.status(400).json({
        success: false,
        error: 'You are already the owner of this project.',
      });
      return;
    }

    // Check if user is already a collaborator
    const inviteeUser = await User.findOne({ email: validated.email });
    if (inviteeUser) {
      const alreadyCollab = project.collaborators.some(
        (c: any) => c.user.toString() === inviteeUser._id.toString()
      );
      if (alreadyCollab) {
        res.status(400).json({
          success: false,
          error: 'This user is already a collaborator on this project.',
        });
        return;
      }
    }

    // Check for existing pending invitation
    let invitation = await Invitation.findOne({
      project: project._id,
      inviteeEmail: validated.email,
      status: 'PENDING',
    });

    if (invitation) {
      invitation.role = validated.role;
      invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await invitation.save();
    } else {
      invitation = await Invitation.create({
        project: project._id,
        inviter: inviterId,
        inviteeEmail: validated.email,
        role: validated.role,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        invitation: {
          id: invitation._id.toString(),
          email: invitation.inviteeEmail,
          role: invitation.role,
          token: invitation.token,
          expiresAt: invitation.expiresAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeCollaborator(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = req.projectDoc;
    const targetUserId = req.params.userId;
    const callerId = req.user?.userId;

    // Cannot remove owner
    if (project.owner.toString() === targetUserId) {
      res.status(400).json({
        success: false,
        error: 'Cannot remove the owner of the project.',
      });
      return;
    }

    // Only OWNER can remove other collaborators; collaborator can remove self
    if (req.userRole !== 'OWNER' && callerId !== targetUserId) {
      res.status(403).json({
        success: false,
        error: 'Only the project owner can remove collaborators.',
      });
      return;
    }

    project.collaborators = project.collaborators.filter(
      (c: any) => c.user.toString() !== targetUserId
    );
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;
    const userId = req.user?.userId;
    const userEmail = req.user?.email;

    const invitation = await Invitation.findOne({
      token,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        error: 'Invitation not found or has expired.',
      });
      return;
    }

    // Check if invitation matches the logged in user's email
    if (invitation.inviteeEmail !== userEmail) {
      res.status(403).json({
        success: false,
        error: `This invitation was sent to ${invitation.inviteeEmail}. You are logged in as ${userEmail}.`,
      });
      return;
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project no longer exists.' });
      return;
    }

    // Add user as collaborator if not already added
    const alreadyCollab = project.collaborators.some((c: any) => c.user.toString() === userId);
    if (!alreadyCollab) {
      project.collaborators.push({
        user: userId as any,
        role: invitation.role,
        addedAt: new Date(),
      });
      await project.save();
    }

    invitation.status = 'ACCEPTED';
    await invitation.save();

    res.status(200).json({
      success: true,
      data: {
        projectId: project._id.toString(),
        message: 'Invitation accepted! You now have access to the project.',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyPendingInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = req.user?.email;
    const invitations = await Invitation.find({
      inviteeEmail: email,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    })
      .populate('project', 'name')
      .populate('inviter', 'name email avatarColor')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        invitations,
      },
    });
  } catch (err) {
    next(err);
  }
}
