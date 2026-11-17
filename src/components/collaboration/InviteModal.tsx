import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, Mail, Shield, Check, Copy, Loader2, AlertCircle } from 'lucide-react';
import { api, UserProfile } from '@/services/api';

interface Props {
  projectId: string;
  projectName: string;
  isOwner: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<Props> = ({ projectId, projectName, isOwner, onClose }) => {
  const [collaborators, setCollaborators] = useState<{ user: UserProfile; role: string; isOwner: boolean }[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const res = await api.projects.getCollaborators(projectId);
      if (res.success && res.data) {
        setCollaborators(res.data.collaborators);
        setPendingInvitations(res.data.pendingInvitations || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.projects.invite(projectId, email.trim(), role);
      setEmail('');
      await fetchCollaborators();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      await api.projects.removeCollaborator(projectId, userId);
      await fetchCollaborators();
    } catch (err: any) {
      setError(err.message || 'Failed to remove collaborator');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7F0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#E5E7F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F6F5FF] flex items-center justify-center text-[#7657FF]">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17182B]">Project Collaborators</h2>
              <p className="text-xs text-[#6B6C85] truncate max-w-xs">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9B9CB5] hover:text-[#17182B] hover:bg-[#F1F2F8] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FDF2F4] border border-[#F9D2D7] text-xs text-[#E05260]">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Invite form - Owner only */}
          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9CB5]">Invite a Collaborator</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9CB5]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#D1D5E8] rounded-xl outline-none focus:border-[#7657FF] text-[#17182B]"
                  />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
                  className="px-3 py-2 text-sm border border-[#D1D5E8] rounded-xl outline-none focus:border-[#7657FF] bg-white text-[#17182B]"
                >
                  <option value="EDITOR">Editor (Can edit)</option>
                  <option value="VIEWER">Viewer (Read only)</option>
                </select>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#7657FF] hover:bg-[#6344E6] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  <span>Invite</span>
                </button>
              </div>
            </form>
          )}

          {/* Active Collaborators list */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9CB5] mb-3">
              Team Members ({collaborators.length})
            </h3>
            {loading ? (
              <div className="py-6 text-center text-sm text-[#9B9CB5]">
                <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[#7657FF]" />
                Loading collaborators...
              </div>
            ) : (
              <div className="divide-y divide-[#F1F2F8] border border-[#E5E7F0] rounded-xl overflow-hidden">
                {collaborators.map((c) => (
                  <div key={c.user?.id || c.user?.email} className="flex items-center justify-between p-3 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: c.user?.avatarColor || '#7657FF' }}
                      >
                        {c.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#17182B] truncate">{c.user?.name}</p>
                        <p className="text-xs text-[#6B6C85] truncate">{c.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          c.isOwner
                            ? 'bg-[#F6F5FF] text-[#7657FF]'
                            : c.role === 'EDITOR'
                            ? 'bg-[#EBFBF8] text-[#3DA08C]'
                            : 'bg-[#F1F2F8] text-[#6B6C85]'
                        }`}
                      >
                        {c.isOwner ? 'Owner' : c.role}
                      </span>
                      {isOwner && !c.isOwner && (
                        <button
                          onClick={() => handleRemove(c.user.id)}
                          className="p-1.5 rounded-lg text-[#9B9CB5] hover:text-[#E05260] hover:bg-[#FDF2F4] transition-colors"
                          title="Remove collaborator"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations list */}
          {isOwner && pendingInvitations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9CB5] mb-3">
                Pending Invitations ({pendingInvitations.length})
              </h3>
              <div className="space-y-2">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv._id || inv.token}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FC] border border-[#E5E7F0]"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#17182B]">{inv.inviteeEmail}</p>
                      <p className="text-[11px] text-[#9B9CB5]">Role: {inv.role}</p>
                    </div>
                    <button
                      onClick={() => copyInviteLink(inv.token)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[#D1D5E8] bg-white text-[#17182B] hover:border-[#7657FF] transition-colors"
                    >
                      {copiedToken === inv.token ? (
                        <>
                          <Check size={13} className="text-[#3DA08C]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
