import React from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Network,
  Zap,
} from 'lucide-react'

export const HomePage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Streamhouse Healthcare Demonstration</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Real-time synchronization of patient health records, vital telemetry, and clinical alerts across Confluent Cloud Streamhouse.
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile">
          <div className="stat-label">Ingestion Pattern</div>
          <div className="stat-val" style={{ fontSize: '1.25rem', color: '#2563eb' }}>Debezium CDC</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            PostgreSQL 17 logical replication (pgoutput)
          </p>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Stream Processing</div>
          <div className="stat-val" style={{ fontSize: '1.25rem', color: '#16a34a' }}>Flink SQL + dbt</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            3 Isolated Compute Pools + 1 Snapshot Pool
          </p>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Serving Mode</div>
          <div className="stat-val" style={{ fontSize: '1.25rem', color: '#d97706' }}>Lightning / RTCE</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Sub-10ms point lookups &amp; AI Chat
          </p>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Event Detection</div>
          <div className="stat-val" style={{ fontSize: '1.25rem', color: '#dc2626' }}>CEP Patterns</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            MATCH_RECOGNIZE vital drifts &amp; alerts
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Key Demonstration Capabilities</h2>
        <div className="grid-2">
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Zap size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Lightning vs. Snapshot Query Benchmark</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Compare query latency between on-demand ad-hoc Flink snapshot queries (seconds) and Confluent Cloud Lightning RTCE point lookups (&lt;10 milliseconds).
            </p>
            <Link to="/analytics" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
              <BarChart3 size={14} /> Open Analytics Benchmark
            </Link>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} color="#dc2626" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Complex Event Processing (CEP) Scenarios</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Trigger deterministic telemetry sequences to fire Flink SQL <code>MATCH_RECOGNIZE</code> patterns: 3 consecutive vital anomalies, emergency button escalation, and geofence departures.
            </p>
            <Link to="/cep" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
              <AlertTriangle size={14} /> Run CEP Scenarios
            </Link>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageSquare size={20} color="#16a34a" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>RTCE AI Clinical Assistant</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Natural language clinical triage assistant powered by Agno and the Real-Time Context Engine (RTCE) MCP server, answering vital and alert questions with zero stale data.
            </p>
            <Link to="/chat" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
              <MessageSquare size={14} /> Open AI Assistant
            </Link>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Network size={20} color="#d97706" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Data Products &amp; Statement Lineage</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Inspect the streaming DAG across Patient Monitoring, Clinical Alerts, and Device Ops pipelines with live Confluent CFU cost governance.
            </p>
            <Link to="/data-products" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
              <Network size={14} /> View Lineage Graph
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
