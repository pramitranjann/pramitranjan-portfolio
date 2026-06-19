const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatHour(hour: number) {
  if (hour === 0 || hour === 24) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

export default function WeekLoading() {
  const hours = Array.from({ length: 25 }, (_, index) => index)

  return (
    <div className="life-week-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Week</p>
          <div className="skeleton-line skeleton-title" style={{ width: 220, margin: '8px 0 0' }} />
        </div>
        <div className="life-week-toolbar">
          <button type="button" className="life-icon-btn" disabled aria-label="Previous week">
            ←
          </button>
          <button type="button" className="life-btn ghost" disabled>
            Today
          </button>
          <button type="button" className="life-icon-btn" disabled aria-label="Next week">
            →
          </button>
        </div>
      </div>

      <div className="life-week-desktop">
        <div className="life-week-desktop-head">
          <div className="life-week-corner" />
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className="life-week-col-head">
              <div className="life-week-col-weekday">{name}</div>
              <div className="life-week-col-date">--</div>
            </div>
          ))}
        </div>

        <div className="life-week-allday-row">
          <div className="life-week-allday-label">all-day</div>
          {WEEKDAY_NAMES.map((name) => (
            <div key={`${name}-allday`} className="life-week-allday-cell" />
          ))}
        </div>

        <div className="life-week-desktop-scroll" style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', padding: '10px 0' }}>
          <div className="life-week-scroll-grid" style={{ gridTemplateColumns: '56px repeat(7, minmax(0, 1fr))' }}>
            <div className="life-week-hour-rail" style={{ height: '1344px' }}>
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="life-week-hour-label"
                  style={{ top: `${hour * 56}px` }}
                >
                  {formatHour(hour)}
                </span>
              ))}
            </div>

            {WEEKDAY_NAMES.map((name, index) => (
              <div
                key={`${name}-day`}
                className={`life-week-day-col${index === 2 ? ' is-today' : ''}`}
                style={{ height: '1344px' }}
              >
                {index === 2 ? (
                  <div className="life-week-now-line" style={{ top: '644px' }}>
                    <span className="life-week-now-dot" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
