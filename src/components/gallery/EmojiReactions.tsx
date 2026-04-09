import { REACTION_EMOJIS } from '@/lib/types';

interface Props {
  reactions: { [emoji: string]: string[] };
  currentUserId: string;
  onReact: (emoji: string) => void;
}

export function EmojiReactions({ reactions, currentUserId, onReact }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {REACTION_EMOJIS.map((emoji) => {
        const reactors = reactions[emoji] || [];
        const hasReacted = reactors.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors min-h-[36px]
              ${hasReacted
                ? 'bg-purple-primary text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <span>{emoji}</span>
            {reactors.length > 0 && <span className="text-xs font-medium">{reactors.length}</span>}
          </button>
        );
      })}
    </div>
  );
}
