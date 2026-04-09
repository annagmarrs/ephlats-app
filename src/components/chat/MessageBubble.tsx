import { Avatar } from '@/components/ui/Avatar';
import type { Message } from '@/lib/types';

interface Props {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
}

export function MessageBubble({ message, isOwn, showSender }: Props) {
  function timeStr(ts: any): string {
    if (!ts) return '';
    const d = ts.toDate?.() || new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isOwn && showSender && (
        <Avatar name={message.senderName} photoUrl={message.senderPhotoUrl} size="xs" />
      )}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isOwn && showSender && (
          <span className="text-xs text-neutral-500 px-1">{message.senderName}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
            ${isOwn
              ? 'bg-purple-primary text-white rounded-br-sm'
              : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
            }`}
        >
          {message.text}
        </div>
        <span className="text-xs text-neutral-400 px-1">{timeStr(message.sentAt)}</span>
      </div>
    </div>
  );
}
