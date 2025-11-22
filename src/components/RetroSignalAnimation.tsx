// this has been created by AI

interface RetroSignalAnimationProps {
  isAnimating: boolean;
}

export function RetroSignalAnimation({ isAnimating }: RetroSignalAnimationProps) {
  return (
    <div className="relative bg-slate-900/50 border border-slate-700/50 rounded-lg w-[16.67rem] h-[3.33rem] overflow-hidden">
      {/* Connection Line */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <line x1="15%" y1="50%" x2="85%" y2="50%" stroke="#334155" strokeWidth="1" strokeDasharray="4,2" />
      </svg>

      <div className="top-1/2 left-2 absolute -translate-y-1/2" style={{ zIndex: 2 }}>
        <div className="relative">
          <svg width="26.67" height="26.67" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V6Z"
              fill="#065f46"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <path d="M2 13H22" stroke="#10b981" strokeWidth="1.5" />
            <path d="M8 17V19" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 17V19" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 19H18" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="4" y="6" width="16" height="6" fill="#10b981" opacity="0.2" />
          </svg>
          {isAnimating && (
            <div className="-top-1 -right-1 absolute bg-emerald-400 rounded-full w-2 h-2 animate-ping" />
          )}
        </div>
      </div>

      <div className="top-1/2 right-2 absolute -translate-y-1/2" style={{ zIndex: 2 }}>
        <div className="relative">
          <svg width="26.67" height="26.67" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V6Z"
              fill="#065f46"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <path d="M2 13H22" stroke="#10b981" strokeWidth="1.5" />
            <path d="M8 17V19" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 17V19" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 19H18" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="4" y="6" width="16" height="6" fill="#10b981" opacity="0.2" />
          </svg>
          {isAnimating && (
            <div
              className="-top-1 -right-1 absolute bg-emerald-400 rounded-full w-2 h-2"
              style={{
                animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) 2.5s 2",
              }}
            />
          )}
        </div>
      </div>

      {isAnimating && (
        <>
          <div
            className="top-1/2 absolute bg-emerald-400 shadow-emerald-400/50 shadow-lg rounded-full w-2 h-2 -translate-y-1/2"
            style={{
              left: "15%",
              zIndex: 3,
              animation: "signalMove 3s ease-in-out forwards",
            }}
          />
          <div
            className="top-1/2 absolute bg-linear-to-r from-transparent via-emerald-400/50 to-emerald-400 rounded-full w-8 h-0.5 -translate-y-1/2"
            style={{
              left: "15%",
              zIndex: 3,
              animation: "signalMove 3s ease-in-out forwards",
            }}
          />
          <div
            className="top-1/2 absolute bg-emerald-300 rounded-sm w-1 h-1 -translate-y-1/2"
            style={{
              left: "15%",
              zIndex: 3,
              animation: "signalMove 3s ease-in-out 0.2s forwards",
            }}
          />
          <div
            className="top-1/2 absolute bg-emerald-300 rounded-sm w-1 h-1 -translate-y-1/2"
            style={{
              left: "15%",
              zIndex: 3,
              animation: "signalMove 3s ease-in-out 0.4s forwards",
            }}
          />
        </>
      )}
    </div>
  )
}