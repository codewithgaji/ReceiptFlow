import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle, Loader2, CloudUpload } from 'lucide-react';

type Status = 'processing' | 'generated' | 'sent' | 'stored' | 'failed';

interface ReceiptStatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string; icon: React.ElementType }> = {
  processing: {
    label: 'Processing',
    className: 'status-badge-pending',
    icon: Loader2,
  },
  generated: {
    label: 'PDF Generated',
    className: 'status-badge-warning',
    icon: Clock,
  },
  sent: {
    label: 'Email Sent',
    className: 'status-badge-success',
    icon: CheckCircle2,
  },
  stored: {
    label: 'Stored',
    className: 'status-badge-success',
    icon: CloudUpload,
  },
  failed: {
    label: 'Failed',
    className: 'status-badge-error',
    icon: XCircle,
  },
};

export function ReceiptStatusBadge({ status, className }: ReceiptStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.className, className)}>
      <Icon className={cn('h-3.5 w-3.5', status === 'processing' && 'animate-spin')} />
      {config.label}
    </span>
  );
}
