'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ActivitySubmission } from '@/src/types/submission';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<ActivitySubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch submissions
  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const q = query(
          collection(db, 'submissions'),
          where('status', '==', filter)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          submissionId: doc.id,
        })) as ActivitySubmission[];
        
        // Sort by date, newest first
        data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissions();
  }, [user, filter]);

  const handleApprove = async (submission: ActivitySubmission) => {
    setProcessing(true);
    try {
      const docRef = doc(db, 'submissions', submission.submissionId);
      await updateDoc(docRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });

      // Remove from list
      setSubmissions(submissions.filter(s => s.submissionId !== submission.submissionId));
      setSelectedSubmission(null);
      alert('Activity approved!');
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (submission: ActivitySubmission) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const docRef = doc(db, 'submissions', submission.submissionId);
      await updateDoc(docRef, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: new Date().toISOString(),
      });

      setSubmissions(submissions.filter(s => s.submissionId !== submission.submissionId));
      setSelectedSubmission(null);
      setRejectionReason('');
      alert('Activity rejected!');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      <header className="header-gradient py-6 px-4 md:px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Submissions</h2>
                <div className="flex gap-2">
                  {(['pending', 'approved', 'rejected'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({submissions.length})
                    </button>
                  ))}
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No {filter} submissions
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {submissions.map(submission => (
                    <button
                      key={submission.submissionId}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedSubmission?.submissionId === submission.submissionId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{submission.name}</h3>
                          <p className="text-sm text-slate-600">{submission.location}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            By {submission.submittedBy} • {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{selectedSubmission.name}</h3>

                <div className="space-y-4 mb-6 text-sm">
                  <div>
                    <p className="text-slate-600">Location</p>
                    <p className="font-semibold text-slate-900">{selectedSubmission.location}</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Price</p>
                    <p className="font-semibold text-slate-900">{selectedSubmission.price}</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Submitted by</p>
                    <p className="font-semibold text-slate-900">{selectedSubmission.submittedBy}</p>
                    <p className="text-slate-600">{selectedSubmission.submitterEmail}</p>
                    {selectedSubmission.submitterPhone && (
                      <p className="text-slate-600">{selectedSubmission.submitterPhone}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-slate-600">Description</p>
                    <p className="text-slate-700 line-clamp-3">{selectedSubmission.description}</p>
                  </div>

                  {selectedSubmission.submitterMessage && (
                    <div>
                      <p className="text-slate-600">Message</p>
                      <p className="text-slate-700">{selectedSubmission.submitterMessage}</p>
                    </div>
                  )}

                  {selectedSubmission.rejectionReason && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-slate-600">Rejection Reason</p>
                      <p className="text-red-700">{selectedSubmission.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleApprove(selectedSubmission)}
                      disabled={processing}
                      className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      ✓ Approve
                    </button>

                    <div>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason (required)..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                        rows={2}
                      />
                      <button
                        onClick={() => handleReject(selectedSubmission)}
                        disabled={processing || !rejectionReason.trim()}
                        className="w-full mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-slate-500">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

