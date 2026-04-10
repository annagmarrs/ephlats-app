import { Avatar } from '@/components/ui/Avatar';
import type { Message } from '@/lib/types';

interface Props {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  isFirst: boolean; // first in consecutive group from same sender
  isLast: boolean;  // last in consecutive group from same sender
}

function timeStr(ts: any): string {
  if (!ts) return '';
  const d = ts.toDate?.() || new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function bubbleShape(isOwn: boolean, isFirst: boolean, isLast: boolean): string {
  if (isOwn) {
    if (isFirst && isLast) return 'rounded-2xl';
    if (isFirst)           return 'rounded-2xl rounded-br-sm';
    if (isLast)            return 'rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl rounded-br-sm';
    return 'rounded-l-2xl rounded-r-sm';
  } else {
    if (isFirst && isLast) return 'rounded-2xl';
    if (isFirst)           return 'rounded-2xl rounded-bl-sm';
    if (isLast)            return 'rounded-tr-2xl rounded-br-2xl rounded-tl-2xl rounded-bl-sm';
    return 'rounded-r-2xl rounded-l-sm';
  }
}

export function MessageBubble({ message, isOwn, showSender, isFirst, isLast }: Props) {
  return (
    <div className={`flex items-end gap-1.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isLast ? 'mb-2' : 'mb-0.5'}`}>

      {/* Avatar column — always reserve width so bubbles stay aligned */}
      {!isOwn && showSender && (
        <div className="w-6 flex-shrink-0">
          {isLast
            ? <Avatar name={message.senderName} photoUrl={message.senderPhotoUrl} size="xs" />
            : <div className="w-6" />
          }
        </div>
      )}

      {/* Bubble + meta */}
      <div className={`flex flex-col max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name — only on first bubble in group, group chats only */}
        {!isOwn && showSender && isFirst && (
          <span className="text-[11px] font-semibold text-purple-dark px-2 mb-0.5">
            {message.senderName}
          </span>
        )}

        {/* Bubble */}
        <div className={`px-3 py-2 text-sm leading-snug break-words ${bubbleShape(isOwn, isFirst, isLast)}
          ${isOwn
            ? 'bg-purple-primary text-white'
            : 'bg-white border border-neutral-200 text-neutral-900 shadow-sm'
          }`}
        >
          {message.text}
        </div>

        {/* Timestamp — only on last bubble in group */}
        {isLast && (
          <span className="text-[10px] text-neutral-400 px-1 mt-1">
            {timeStr(message.sentAt)}
          </span>
        )}
      </div>
    </div>
  );
}
