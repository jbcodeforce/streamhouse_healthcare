import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Streamhouse Healthcare Monitoring & Clinical Alerts
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="badge badge-low">PostgreSQL CDC Active</span>
        <span className="badge badge-low">Flink SQL Streaming</span>
      </div>
    </header>
  )
}
