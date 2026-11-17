import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProjectRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface ICollaborator {
  user: Types.ObjectId;
  role: ProjectRole;
  addedAt: Date;
}

export interface IProject extends Document {
  name: string;
  owner: Types.ObjectId;
  collaborators: ICollaborator[];
  tree: any[]; // ComponentNode[]
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema<ICollaborator>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'EDITOR', 'VIEWER'],
      default: 'EDITOR',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
      default: 'Untitled Project',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaborators: {
      type: [CollaboratorSchema],
      default: [],
    },
    tree: {
      type: Schema.Types.Mixed,
      default: [],
    },
    thumbnail: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

ProjectSchema.index({ 'collaborators.user': 1 });
ProjectSchema.index({ updatedAt: -1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
