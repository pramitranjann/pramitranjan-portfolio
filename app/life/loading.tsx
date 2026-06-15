export default function LifeLoading() {
  return (
    <div className="life-today">
      <section className="life-capture">
        <div className="skeleton-line skeleton-title" style={{ width: '30%', marginLeft: 0 }} />
        <div className="skeleton-line" style={{ height: 32, width: '60%', marginLeft: 0, marginTop: 8 }} />
        <div className="life-card" style={{ marginTop: 16 }}>
          <div className="skeleton-line" style={{ minHeight: 120 }} />
        </div>
      </section>
      <aside className="life-side">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="life-card life-card-skeleton">
            <div className="life-card-head">
              <div className="skeleton-line skeleton-title" />
            </div>
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-short" />
          </div>
        ))}
      </aside>
    </div>
  )
}
