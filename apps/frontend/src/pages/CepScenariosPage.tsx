import React, { useEffect, useState } from 'react'
import { getScenarios, runScenario, type ScenarioItem, type ScenarioRunResult } from '../api/scenarios'
import { Play, CheckCircle2, ShieldAlert } from 'lucide-react'

export const CepScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [runningId, setRunningId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ScenarioRunResult>>({})

  useEffect(() => {
    getScenarios().then(setScenarios).catch(console.error)
  }, [])

  const handleRun = async (id: string) => {
    setRunningId(id)
    try {
      const res = await runScenario(id)
      setResults((prev) => ({ ...prev, [id]: res }))
    } catch (err) {
      console.error(err)
    } finally {
      setRunningId(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Complex Event Processing (CEP) Scenarios</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Inject scripted telemetry sequences into PostgreSQL (carried via CDC to Kafka) to deterministically fire Flink SQL <code>MATCH_RECOGNIZE</code> patterns.
          </p>
        </div>
      </div>

      <div className="grid-2">
        {scenarios.map((sc) => {
          const runRes = results[sc.id]
          const isRunning = runningId === sc.id

          return (
            <div key={sc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert color="#dc2626" size={20} />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{sc.title}</h2>
                  </div>
                  <span className="badge badge-medium">{sc.cep_fact_table}</span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {sc.description}
                </p>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <strong>Matching Logic:</strong> {sc.explanation}
                </div>
              </div>

              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleRun(sc.id)}
                  disabled={isRunning}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Play size={16} /> {isRunning ? 'Injecting Telemetry Sequence...' : 'Trigger CEP Scenario'}
                </button>

                {runRes && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: '#166534',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      Injected <strong>{runRes.events_injected}</strong> telemetry events into PostgreSQL! Debezium CDC and Flink SQL pattern match active in <code>{runRes.cep_fact_table}</code>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
