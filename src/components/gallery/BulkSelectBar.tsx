import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  count: number;
  onDownload: () => void;
  onCancel: () => void;
}

export function BulkSelectBar({ count, onDownload, onCancel }: Props) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <span className="flex-1 text-sm font-medium text-neutral-700">
          {count} photo{count !== 1 ? 's' : ''} selected
        </span>
        <Button variant="secondary" onClick={onCancel} size="sm">Cancel</Button>
        <Button
          onClick={onDownload}
          disabled={count === 0}
          size="sm"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download All
        </Button>
      </div>
    </div>
  );
}
