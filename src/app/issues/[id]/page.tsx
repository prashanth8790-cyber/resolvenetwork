'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import StatusBadge from '@/components/issues/StatusBadge';
import SeverityBadge from '@/components/issues/SeverityBadge';
import PriorityBadge from '@/components/issues/PriorityBadge';
import StatusTimeline from '@/components/issues/StatusTimeline';
import IssueMap from '@/components/maps/IssueMap';
import { uploadImageToCloudinary } from '@/lib/services/storage';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Upload,
  Trash2,
  Send,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  Copy,
  ExternalLink,
  Navigation,
  LocateFixed,
} from 'lucide-react';

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Support / Upvote State
  const [supportCount, setSupportCount] = useState(0);
  const [hasSupported, setHasSupported] = useState(false);
  const [supporting, setSupporting] = useState(false);

  // Authority Status Transition Modal / Form
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Citizen Verification Modal / Form
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Authorities list for assigning
  const [authorities, setAuthorities] = useState<any[]>([]);

  // Coordinate copy state
  const [coordsCopied, setCoordsCopied] = useState(false);

  const handleCopyCoords = () => {
    if (!issue) return;
    navigator.clipboard.writeText(`${issue.lat.toFixed(6)}, ${issue.lng.toFixed(6)}`).then(() => {
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    });
  };

  const fetchIssueDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIssue(json.data.issue);
          setSupportCount(json.data.issue.supportCount);
          setHasSupported(json.data.issue.hasSupported);
        } else {
          setError(json.error?.message || 'Issue not found');
        }
      } else {
        setError('Failed to load issue');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  useEffect(() => {
    if (user && (user.role === 'AUTHORITY' || user.role === 'ADMIN')) {
      fetch('/api/users')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setAuthorities(json.data.users.filter((u: any) => u.role === 'AUTHORITY' || u.role === 'ADMIN'));
          }
        });
    }
  }, [user]);

  const handleSupportToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setSupporting(true);
    try {
      const res = await fetch(`/api/issues/${id}/support`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSupportCount(json.data.supportCount);
          setHasSupported(json.data.hasSupported);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSupporting(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      const res = await fetch(`/api/comments?issueId=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText('');
        fetchIssueDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchIssueDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      let beforeUrl = issue.beforeImage;
      let afterUrl = issue.afterImage;

      if (beforeFile) {
        beforeUrl = await uploadImageToCloudinary(beforeFile);
      }
      if (afterFile) {
        afterUrl = await uploadImageToCloudinary(afterFile);
      }

      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          assignedToId: assignedToId || undefined,
          beforeImage: beforeUrl || undefined,
          afterImage: afterUrl || undefined,
          note: statusNote,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Failed to update status');
      } else {
        setShowStatusModal(false);
        fetchIssueDetail();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCitizenVerification = async (confirmed: boolean) => {
    if (!confirmed && !reopenReason) {
      alert('Please provide a reason for reopening');
      return;
    }

    try {
      const newStatus = confirmed ? 'CLOSED' : 'REOPENED';
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: confirmed ? 'Citizen verified issue resolution' : reopenReason,
          reopenReason,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Verification failed');
      } else {
        setShowReopenModal(false);
        fetchIssueDetail();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500 animate-pulse">Loading issue details...</div>;
  }

  if (error || !issue) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Issue Not Found</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Issues
        </Link>
      </div>
    );
  }

  const isReporter = user?.id === issue.reporterId;
  const isAuthorityOrAdmin = user?.role === 'AUTHORITY' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 py-4">
      {/* Back Link */}
      <Link href="/issues" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition">
        <ArrowLeft className="w-4 h-4" /> Back to all issues
      </Link>

      {/* Main Issue Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={issue.status} />
              <SeverityBadge severity={issue.severity} />
              <PriorityBadge
                score={issue.priorityScore}
                severity={issue.severity}
                supportCount={supportCount}
                createdAt={issue.createdAt}
                status={issue.status}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{issue.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {issue.address} ({issue.ward?.name})
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Reported by {issue.reporter?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(issue.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Upvote & Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSupportToggle}
              disabled={supporting}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm ${
                hasSupported ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Upvote ({supportCount})</span>
            </button>

            {isAuthorityOrAdmin && (
              <button
                onClick={() => {
                  setTargetStatus('UNDER_REVIEW');
                  setShowStatusModal(true);
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                Update Status
              </button>
            )}
          </div>
        </div>

        {/* Citizen Verification Alert banner if status is RESOLVED */}
        {issue.status === 'RESOLVED' && (
          <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Resolution Marked by Authority
              </h4>
              <p className="text-xs text-emerald-700">
                Municipal officers have uploaded before/after proof and marked this issue resolved. Reporter verification requested!
              </p>
            </div>

            {(isReporter || user?.role === 'ADMIN') && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCitizenVerification(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Yes, Resolved
                </button>
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> No, Still Exists
                </button>
              </div>
            )}
          </div>
        )}

        {/* Description & Images Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Issue Description</h3>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{issue.description}</p>

          {/* Reported Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="font-semibold text-slate-800 text-xs">Attached Photo Proof ({issue.images.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {issue.images.map((img: any) => (
                  <div key={img.id} className="relative h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <Image src={img.url} alt="Issue photo" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before & After Proof Side-by-Side (When Available) */}
          {(issue.beforeImage || issue.afterImage) && (
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Before & After Resolution Proof
              </h3>
              {issue.resolutionNote && (
                <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                  Note: "{issue.resolutionNote}"
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1">Before Resolution</span>
                  <div className="relative h-56 rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
                    {issue.beforeImage ? (
                      <Image src={issue.beforeImage} alt="Before" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1">After Resolution</span>
                  <div className="relative h-56 rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
                    {issue.afterImage ? (
                      <Image src={issue.afterImage} alt="After" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Grid: Map + Timeline & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Map & Assigned Officer */}
        <div className="lg:col-span-5 space-y-6">
          {/* Enhanced Location Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Map - full bleed to top */}
            <IssueMap issues={[issue]} center={[issue.lat, issue.lng]} zoom={16} height="320px" singleIssue={true} />

            {/* Location Details below map */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-snug">{issue.address}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{issue.ward?.name}</p>
                  </div>
                </div>
              </div>

              {/* Coordinates row */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <LocateFixed className="w-3.5 h-3.5 text-slate-500" />
                  <code className="text-[11px] font-mono text-slate-700 select-all">
                    {issue.lat.toFixed(5)}, {issue.lng.toFixed(5)}
                  </code>
                </div>
                <button
                  onClick={handleCopyCoords}
                  title="Copy coordinates"
                  className="p-1 rounded-lg hover:bg-slate-200 transition text-slate-500 hover:text-slate-800"
                >
                  {coordsCopied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* External map action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.google.com/maps?q=${issue.lat},${issue.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-[11px] font-bold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${issue.lat},${issue.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Street View
                </a>
              </div>
            </div>
          </div>

          {/* Assigned Officer info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Assigned Authority</h3>
            {issue.assignedTo ? (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  {issue.assignedTo.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{issue.assignedTo.name}</p>
                  <p className="text-[11px] text-blue-700 font-medium">{issue.assignedTo.department || 'Municipal Authority'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Not yet assigned to an officer.</p>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Lifecycle History Log</h3>
            <StatusTimeline history={issue.statusHistory} />
          </div>
        </div>

        {/* Right Column: Comments Discussion */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Citizen & Authority Discussion
              </h3>
              <span className="text-xs font-semibold text-slate-500">{issue.comments?.length || 0} comments</span>
            </div>

            {/* Post Comment Form */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment or question..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Please{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                  log in
                </Link>{' '}
                to leave a comment.
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-3 divide-y divide-slate-100">
              {issue.comments?.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No comments yet. Start the conversation!</p>
              ) : (
                issue.comments?.map((c: any) => (
                  <div key={c.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{c.author?.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold uppercase">
                          {c.author?.role}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.text}</p>
                    </div>

                    {(user?.role === 'ADMIN' || user?.id === c.authorId) && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authority Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Update Operational Issue Status</h3>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Lifecycle Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED (Requires Proof Images)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {targetStatus === 'ASSIGNED' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Officer</label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="">Select officer...</option>
                    {authorities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.department || 'Authority'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetStatus === 'RESOLVED' && (
                <div className="space-y-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-900">Before & After Proof Images Required</p>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-800 mb-1">Before Resolution Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-800 mb-1">After Resolution Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Update Note</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Reason or notes regarding this status transition..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  {updatingStatus ? 'Saving...' : 'Apply Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Reopen Unresolved Issue
            </h3>
            <p className="text-xs text-slate-600">
              Please explain why the issue is still not resolved so authority crews can take corrective action.
            </p>
            <textarea
              required
              rows={4}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Pothole was only partially filled and rain washed it out..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCitizenVerification(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Submit Reopen Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
