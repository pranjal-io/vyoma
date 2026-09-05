interface MessageBubbleProps {
  text: string
  isUser: boolean
  isTyping?: boolean
  timestamp?: string
}

export default function MessageBubble({
  text,
  isUser,
  isTyping = false,
  timestamp,
}: MessageBubbleProps) {
  // Try to parse the date to format it if passed, else just use the string or empty
  let timeString = ""
  if (timestamp) {
    try {
      const d = new Date(timestamp)
      if (!isNaN(d.getTime())) {
        timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        timeString = timestamp
      }
    } catch {
      timeString = timestamp
    }
  }

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-6`}
      style={{ animation: 'messageIn 0.3s ease-out forwards' }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-xs shadow-[0_0_10px_rgba(124,92,255,0.4)] mr-3 mt-auto mb-5 shrink-0">
          V
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div
          className={`px-5 py-3 rounded-2xl ${
            isUser
              ? 'bg-[#7C5CFF] text-white rounded-br-sm shadow-md'
              : 'bg-white/5 border border-white/10 text-white rounded-bl-sm backdrop-blur-md'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1.5 items-center justify-center h-6 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
        </div>
        
        {timeString && !isTyping && (
          <span className="text-[10px] text-text-muted mt-1.5 px-1">
            {timeString}
          </span>
        )}
      </div>
    </div>
  )
}
