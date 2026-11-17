import React from 'react'
import { Handle, Position } from '@xyflow/react'
import type { StatementNodeData } from '../types/dataProduct'

interface StatementNodeProps {
  data: StatementNodeData
}

export const StatementNode: React.FC<StatementNodeProps> = ({ data }) => {
  const isSource = data.type === 'source'
  const isProduct = data.is_product

  let borderColor = '#94a3b8'
  let bgColor = '#ffffff'
  let badgeText = data.table_type

  if (isSource) {
    borderColor = '#3b82f6'
    bgColor = '#eff6ff'
    badgeText = 'CDC Topic'
  } else if (isProduct) {
    borderColor = '#16a34a'
    bgColor = '#f0fdf4'
    badgeText = 'Product / RTCE'
  }

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '0.375rem',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        minWidth: 200,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {data.label}
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            padding: '0.125rem 0.375rem',
            borderRadius: 4,
            background: isProduct ? '#dcfce7' : isSource ? '#dbeafe' : '#f1f5f9',
            color: isProduct ? '#166534' : isSource ? '#1e40af' : '#475569',
            fontWeight: 600,
          }}
        >
          {badgeText}
        </span>
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
        {data.topic || data.statement_name || 'CDC Stream'}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
