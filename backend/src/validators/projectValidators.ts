import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name cannot be empty').max(100).optional(),
  tree: z.array(z.any()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  tree: z.array(z.any()).optional(),
  thumbnail: z.string().optional(),
});

export const inviteCollaboratorSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  role: z.enum(['EDITOR', 'VIEWER']),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
