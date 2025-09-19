'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PendingRegistration } from '@/types';
import { pendingRegistrationService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PendingRegistrationsProps {
  onRegistrationProcessed?: () => void;
}

export const PendingRegistrations: React.FC<PendingRegistrationsProps> = ({
  onRegistrationProcessed
}) => {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    try {
      setIsLoading(true);
      const data = await pendingRegistrationService.getPendingRegistrations();
      setPendingRegistrations(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading pending registrations:', err);
      setError('Failed to load pending registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;

    try {
      setProcessingId(id);
      // Use the current user's ID (should be admin)
      await pendingRegistrationService.approveRegistration(id, user.id);

      // Remove from pending list
      setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
      setError(null);

      // Notify parent component
      onRegistrationProcessed?.();
    } catch (err) {
      console.error('Error approving registration:', err);
      setError('Failed to approve registration');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;

    try {
      setProcessingId(id);
      // Use the current user's ID (should be admin)
      await pendingRegistrationService.rejectRegistration(id, user.id, rejectionReason);

      // Remove from pending list
      setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
      setShowRejectModal(null);
      setRejectionReason('');
      setError(null);

      // Notify parent component
      onRegistrationProcessed?.();
    } catch (err) {
      console.error('Error rejecting registration:', err);
      setError('Failed to reject registration');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Pending Student Registrations</span>
            {pendingRegistrations.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingRegistrations.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center px-4 py-3 mb-4 space-x-2 text-red-700 border border-red-200 rounded-md bg-red-50">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {pendingRegistrations.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Pending Registrations</h3>
              <p className="text-gray-500">All student registrations have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3 space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {registration.name}
                          </h4>
                          <p className="text-sm text-gray-500">@{registration.username}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{registration.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Requested: {formatDate(registration.requested_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center mb-4 space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {registration.role}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {registration.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center ml-4 space-x-2">
                      <Button
                        onClick={() => handleApprove(registration.id)}
                        disabled={processingId === registration.id}
                        className="text-white bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {processingId === registration.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => setShowRejectModal(registration.id)}
                        disabled={processingId === registration.id}
                        variant="outline"
                        className="text-red-700 border-red-300 hover:bg-red-50"
                        size="sm"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <div className="flex items-center mb-4 space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-medium">Reject Registration</h3>
            </div>
            
            <p className="mb-4 text-gray-600">
              Are you sure you want to reject this registration? You can optionally provide a reason.
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
            
            <div className="flex items-center justify-end mt-6 space-x-3">
              <Button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                variant="outline"
                disabled={processingId === showRejectModal}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                className="text-white bg-red-600 hover:bg-red-700"
              >
                {processingId === showRejectModal ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Reject Registration'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};