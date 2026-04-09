import { ERA_OPTIONS } from '@/lib/types';
import type { Era } from '@/lib/types';

interface Props {
  selected: Era | 'All';
  onChange: (era: Era | 'All') => void;
}

export function EraFilter({ selected, onChange }: Props) {
  const options: (Era | 'All')[] = ['All', ...ERA_OPTIONS];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((era) => (
        <button
          key={era}
          onClick={() => onChange(era)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors min-h-[36px]
            ${selected === era
              ? 'bg-purple-primary text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
        >
          {era}
        </button>
      ))}
    </div>
  );
}
