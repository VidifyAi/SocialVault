'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface TransferStepFormProps {
  transactionId: string;
  stepNumber: number;
  onComplete: () => void;
}

export function TransferStepForm({
  transactionId,
  stepNumber,
  onComplete,
}: TransferStepFormProps) {
  const { toast } = useToast();
  const [proof, setProof] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (proof) {
        formData.append('proof', proof);
      }
      if (notes) {
        formData.append('notes', notes);
      }

      await api.post(
        `/transactions/${transactionId}/transfer/steps/${stepNumber}/complete`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast({
        title: 'Step completed!',
        description: 'The next step is now available.',
      });
      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to complete step',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="proof">Upload Proof (Screenshot)</Label>
        <Input
          id="proof"
          type="file"
          accept="image/*"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Upload a screenshot showing you completed this step
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
          rows={3}
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading || !proof}>
        {loading ? 'Completing...' : 'Mark Step as Complete'}
      </Button>
    </form>
  );
}

