import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sendPhotoLink } from '../../api/customers';
import { Send } from 'lucide-react';

interface SendPhotoLinkCardProps {
  customerId: string;
}

const SendPhotoLinkCard = ({ customerId }: SendPhotoLinkCardProps) => {
  const [link, setLink] = useState('');

  const mutation = useMutation({
    mutationFn: () => sendPhotoLink(customerId, link),
    onSuccess: () => {
      toast.success('Photo link sent successfully!');
      setLink('');
    },
    onError: (error) => {
      toast.error(`Failed to send link: ${error.message}`);
    },
  });

  const handleSend = () => {
    if (!link) {
      toast.warning('Please enter a link to send.');
      return;
    }
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Send Photo Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="https://your-photo-gallery.com/..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          disabled={mutation.isPending}
        />
        <Button onClick={handleSend} disabled={mutation.isPending} className="w-full gap-2">
          {mutation.isPending ? 'Sending...' : 'Send Link'}
          <Send className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SendPhotoLinkCard;
