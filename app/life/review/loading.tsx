export default function WeekLoading() {
  return (
    <div className="life-week-shell">
      <div className="life-week-toolbar">
        <div className="skeleton-line" style={{ width: 80, height: 32, margin: 0 }} />
        <div className="skeleton-line skeleton-title" style={{ width: '30%', margin: '0 16px' }} />
        <div className="skeleton-line" style={{ width: 80, height: 32, margin: 0 }} />
      </div>
      <div className="life-week-grid">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="life-card life-card-skeleton" style={{ minHeight: 120 }}>
            <div className="life-card-head">
              <div className="skeleton-line skeleton-title" />
            </div>
            <div className="skeleton-line skeleton-short" />
          </div>
        ))}
      </div>
    </div>
  )
}
