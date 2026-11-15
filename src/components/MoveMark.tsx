import type { DanceMove } from '../types'

const labels: Record<DanceMove, string> = {
  subsidence: 'slow downward pulse',
  glacier: 'steady gliding arrows',
  flood: 'expanding and shrinking ripple',
  flash: 'flash and fade',
}

export function MoveMark({ move }: { move: DanceMove }) {
  return (
    <div className={`move-mark move-mark--${move}`} role="img" aria-label={labels[move]}>
      {move === 'subsidence' && (
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <circle className="pulse pulse--one" cx="36" cy="27" r="18" />
          <circle className="pulse pulse--two" cx="36" cy="27" r="18" />
          <path className="move-line" d="M15 48h42M36 17v28m-8-8 8 8 8-8" />
          <circle className="move-dot" cx="36" cy="49" r="3" />
        </svg>
      )}
      {move === 'glacier' && (
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <path className="glacier-ridge" d="M11 51 28 22l10 15 8-13 15 27H11Z" />
          <path className="glide glide--one" d="M13 57h28m-7-6 7 6-7 6" />
          <path className="glide glide--two" d="M27 63h31m-7-6 7 6-7 6" />
        </svg>
      )}
      {move === 'flood' && (
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <circle className="ripple ripple--one" cx="36" cy="36" r="11" />
          <circle className="ripple ripple--two" cx="36" cy="36" r="20" />
          <circle className="ripple ripple--three" cx="36" cy="36" r="29" />
          <circle className="move-dot" cx="36" cy="36" r="3" />
        </svg>
      )}
      {move === 'flash' && (
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <path className="flash-ray flash-ray--one" d="m36 8 2 21-2 8-2-8 2-21Z" />
          <path className="flash-ray flash-ray--two" d="m60 22-15 15-7 4 4-7 18-12Z" />
          <path className="flash-ray flash-ray--three" d="m62 49-21-3-8-4 8-1 21 8Z" />
          <path className="flash-ray flash-ray--four" d="m14 52 15-15 7-4-4 7-18 12Z" />
          <circle className="flash-core" cx="36" cy="38" r="8" />
        </svg>
      )}
    </div>
  )
}
