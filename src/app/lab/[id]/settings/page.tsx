import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

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
  const session = useSession();
  const params = useParams();
  const labId = params.id as string;
  const [contributionRequests, setContributionRequests] = useState<ContributionRequest[]>([]);

  useEffect(() => {
    if (labId) {
      fetchContributionRequests();
    }
  }, [labId]);

  const fetchContributionRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('contribution_requests')
        .select('*')
        .eq('labFrom', labId);

      if (error) throw error;

      setContributionRequests(data || []);
    } catch (error) {
      console.error('Error fetching contribution requests:', error);
      toast.error('Failed to fetch contribution requests');
    }
  };

  const handleAccept = async (request: ContributionRequest) => {
    console.log('Accept button clicked!');  // Immediate feedback
    console.log('Request:', request);
    console.log('Lab ID:', labId);
    console.log('Session:', session);
    
    if (!labId) {
      toast.error('Lab ID is missing');
      return;
    }

    if (!session?.data?.user?.id) {
      toast.error('You must be logged in to accept contributions');
      return;
    }

    try {
      // First, let's just try to update the status
      const { error: updateError } = await supabase
        .from('contribution_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id)
        .eq('labFrom', labId);

      if (updateError) {
        console.error('Failed to update status:', updateError);
        toast.error('Failed to update status');
        return;
      }

      console.log('Status updated successfully');

      // If that works, then proceed with file operations
      const fileMoves = request.files.map(async (file) => {
        console.log('Processing file:', file);
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('cont-requests')
          .download(file.storage_key);

        if (downloadError) {
          console.error('Download error:', downloadError);
          throw downloadError;
        }

        const newStorageKey = `lab-${labId}/${file.name}`;
        console.log('Uploading to new location:', newStorageKey);
        
        const { error: uploadError } = await supabase.storage
          .from('lab-materials')
          .upload(newStorageKey, fileData);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Delete from cont-requests after successful move
        console.log('Deleting from cont-requests:', file.storage_key);
        const { error: deleteError } = await supabase.storage
          .from('cont-requests')
          .remove([file.storage_key]);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }

        return {
          ...file,
          storage_key: newStorageKey,
          bucket: 'lab-materials'
        };
      });

      const movedFiles = await Promise.all(fileMoves);
      console.log('Files moved successfully:', movedFiles);

      // Update the files array
      const { error: filesUpdateError } = await supabase
        .from('contribution_requests')
        .update({ files: movedFiles })
        .eq('id', request.id)
        .eq('labFrom', labId);

      if (filesUpdateError) {
        console.error('Failed to update files:', filesUpdateError);
        toast.error('Failed to update files');
        return;
      }

      // Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          lab_id: labId,
          user_id: session.data.user.id,
          action: 'accepted_contribution',
          details: {
            request_id: request.id,
            title: request.title,
            contributor_id: request.submittedBy
          }
        });

      if (activityError) {
        console.error('Activity log error:', activityError);
        toast.error('Failed to log activity');
        return;
      }

      // Refresh data
      await fetchContributionRequests();
      toast.success('Contribution accepted successfully');
    } catch (error) {
      console.error('Error accepting contribution:', error);
      toast.error('Failed to accept contribution');
    }
  };

  const handleReject = async (request: ContributionRequest) => {
    try {
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
          files: [] // Clear files array since they're deleted
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // 3. Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          lab_id: labId,
          user_id: session?.user?.id,
          action: 'rejected_contribution',
          details: {
            request_id: request.id,
            title: request.title,
            contributor_id: request.submittedBy
          }
        });

      if (activityError) throw activityError;

      // 4. Refresh data
      fetchContributionRequests();
      toast.success('Contribution rejected');
    } catch (error) {
      console.error('Error rejecting contribution:', error);
      toast.error('Failed to reject contribution');
    }
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
                  onClick={() => {
                    console.log('Button clicked for request:', request.id);
                    handleAccept(request);
                  }}
                  disabled={request.status !== 'pending'}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(request)}
                  disabled={request.status !== 'pending'}
                >
                  Reject
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Status: {request.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabSettingsPage; 