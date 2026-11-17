import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDataProducts, getBillingCosts } from '../api/dataProducts'
import type { BillingCostItem, DataProductDescriptor } from '../types/dataProduct'
import { Network, ArrowRight, DollarSign } from 'lucide-react'

export const DataProductsPage: React.FC = () => {
  const [products, setProducts] = useState<DataProductDescriptor[]>([])
  const [costs, setCosts] = useState<BillingCostItem[]>([])

  useEffect(() => {
    getDataProducts().then(setProducts).catch(console.error)
    getBillingCosts().then(setCosts).catch(console.error)
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Data Products & Statement Lineage</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Governed data products running on dedicated Confluent Cloud Flink compute pools.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={20} color="#16a34a" /> Compute Pool Governance & CFU Monthly Cost
        </h2>
        <div className="grid-4">
          {costs.map((c) => (
            <div key={c.pool_name} className="stat-tile">
              <div className="stat-label">{c.pool_name}</div>
              <div className="stat-val" style={{ fontSize: '1.25rem' }}>${c.monthly_cost_usd.toFixed(2)}/mo</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Allocated Capacity: {c.cfu} CFUs
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {products.map((p) => {
          const productNodes = p.nodes.filter((n) => n.is_product)
          return (
            <div key={p.product_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Network size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{p.name}</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Includes <strong>{p.nodes.length}</strong> Flink SQL statements and topics with <strong>{p.edges.length}</strong> lineage dependencies.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    PRIMARY SERVING TOPICS:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {productNodes.map((n) => (
                      <span key={n.id} className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                        {n.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Link to={`/data-products/${p.product_id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  View Statement Lineage Graph <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
