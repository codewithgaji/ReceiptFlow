import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

type WorkflowStep = 'processing' | 'generated' | 'sent' | 'stored';

interface StatusWorkflowProps {
  currentStatus: WorkflowStep | 'failed';
  className?: string;
}

const steps: { key: WorkflowStep; label: string }[] = [
  { key: 'processing', label: 'Processing' },
  { key: 'generated', label: 'PDF Generated' },
  { key: 'sent', label: 'Email Sent' },
  { key: 'stored', label: 'Stored in Cloud' },
];

const getStepIndex = (status: WorkflowStep | 'failed'): number => {
  if (status === 'failed') return -1;
  return steps.findIndex((s) => s.key === status);
};

export function StatusWorkflow({ currentStatus, className }: StatusWorkflowProps) {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isComplete = currentIndex > index;
        const isCurrent = currentIndex === index;
        const isPending = currentIndex < index;
        const isFailed = currentStatus === 'failed';

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  isComplete && 'bg-success text-success-foreground',
                  isCurrent && !isFailed && 'bg-primary text-primary-foreground',
                  isCurrent && isFailed && 'bg-destructive text-destructive-foreground',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent && !isFailed ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 whitespace-nowrap',
                  isComplete && 'text-success',
                  isCurrent && !isFailed && 'text-primary font-medium',
                  isCurrent && isFailed && 'text-destructive font-medium',
                  isPending && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-12 mx-2 transition-all duration-300',
                  currentIndex > index ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
