import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { ContributionDetailModal, Contribution } from '@/components/contribution-detail-modal';
import { useAuth } from '@/components/auth-provider';

interface File {
  name: string;
  storage_key: string;
  bucket: string;
  type: string;
  size: number;
}

interface ContributionRequest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedBy: string;
  labFrom: string;
  files: File[];
  created_at: string;
  num_files: number;
}

const LabSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const params = useParams();
  const labId = params.id as string;
  const [contributionRequests, setContributionRequests] = useState<ContributionRequest[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [contributionDetailOpen, setContributionDetailOpen] = useState(false);

  useEffect(() => {
    if (labId) {
      fetchContributionRequests();
    }
  }, [labId]);

  const fetchContributionRequests = async () => {
    console.log('[FETCH] Fetching contribution requests for labId:', labId);
    try {
      const { data, error } = await supabase
        .from('contribution_requests')
        .select('*')
        .eq('labFrom', labId);

      if (error) throw error;

      setContributionRequests(data || []);
      console.log('[FETCH] Fetched contribution requests:', data);
    } catch (error) {
      console.error('[FETCH] Error fetching contribution requests:', error);
      toast.error('Failed to fetch contribution requests');
    }
  };

  const handleApproveContribution = async (id: string) => {
    console.log('[APPROVE] Handler called with id:', id, 'type:', typeof id);
    try {
      const request = contributionRequests.find(r => Number(r.id) === Number(id));
      console.log('[APPROVE] Found request:', request);
      if (!request) {
        console.error('[APPROVE] No matching request found for id:', id);
        return;
      }

      const updatePayload = {
        status: 'accepted',
        reviewedBy: user?.id,
        reviewed_at: new Date().toISOString()
      };
      console.log('[APPROVE] Update payload:', updatePayload);

      const { data, error: updateError } = await supabase
        .from('contribution_requests')
        .update(updatePayload)
        .eq('id', Number(id))
        .eq('labFrom', request.labFrom);

      console.log('[APPROVE] Update result:', data, updateError);
      if (updateError) throw updateError;

      console.log('[APPROVE] Calling fetchContributionRequests');
      await fetchContributionRequests();
      toast.success('Contribution accepted successfully');
    } catch (error) {
      console.error('[APPROVE] Error accepting contribution:', error);
      toast.error('Failed to accept contribution');
    }
  };

  const handleRejectContribution = async (id: string, reason: string) => {
    try {
      const request = contributionRequests.find(r => r.id === id);
      if (!request) return;

      // 1. Delete all files from cont-requests
      const deletePromises = request.files.map(async (file) => {
        const { error: deleteError } = await supabase.storage
          .from('cont-requests')
          .remove([file.storage_key]);

        if (deleteError) throw deleteError;
      });

      await Promise.all(deletePromises);

      // 2. Update contribution request status
      const { error: updateError } = await supabase
        .from('contribution_requests')
        .update({ 
          status: 'rejected',
          files: [],
          reject_reason: reason
        })
        .eq('id', id)
        .eq('labFrom', labId);

      if (updateError) throw updateError;

      // 3. Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          lab_id: labId,
          user_id: user?.id,
          action: 'rejected_contribution',
          details: {
            request_id: id,
            title: request.title,
            contributor_id: request.submittedBy,
            reason
          }
        });

      if (activityError) throw activityError;

      // 4. Refresh data
      await fetchContributionRequests();
      toast.success('Contribution rejected');
    } catch (error) {
      console.error('Error rejecting contribution:', error);
      toast.error('Failed to reject contribution');
    }
  };

  const handleViewContribution = async (request: ContributionRequest) => {
    // Fetch contributor info
    const { data: contributorData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', request.submittedBy)
      .single();

    // Convert to Contribution type
    const contribution: Contribution = {
      id: request.id,
      title: request.title,
      description: request.description,
      contributor: {
        id: request.submittedBy,
        name: contributorData?.username || 'Unknown User',
        avatar: contributorData?.avatar_url || ''
      },
      date: request.created_at,
      status: request.status as 'pending' | 'approved' | 'rejected',
      files: request.files.map(f => ({
        id: f.storage_key,
        name: f.name,
        type: f.type as 'code' | 'data' | 'document' | 'other',
        url: '',
        storage_key: f.storage_key
      })),
      submittedBy: request.submittedBy,
      created_at: request.created_at
    };

    setSelectedContribution(contribution);
    setContributionDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contribution Requests</h2>
      <div className="space-y-4">
        {contributionRequests.map((request) => (
          <div key={request.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{request.title}</h3>
                <p className="text-sm text-gray-500">Type: {request.type}</p>
                <p className="text-sm">{request.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewContribution(request)}
                >
                  View Details
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Status: {request.status}
            </div>
          </div>
        ))}
      </div>

      <ContributionDetailModal
        contribution={selectedContribution}
        isOpen={contributionDetailOpen}
        onClose={() => {
          setContributionDetailOpen(false);
          setSelectedContribution(null);
        }}
        onApproved={fetchContributionRequests}
        onReject={handleRejectContribution}
      />
    </div>
  );
};

export default LabSettingsPage; 