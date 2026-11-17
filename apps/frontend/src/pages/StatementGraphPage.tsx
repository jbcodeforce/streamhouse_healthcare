import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { getDataProduct } from '../api/dataProducts'
import { StatementNode } from '../components/StatementNode'
import { getLayoutedElements } from '../lib/graphLayout'
import type { StatementNodeData } from '../types/dataProduct'
import { ArrowLeft, Code } from 'lucide-react'

export const StatementGraphPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [descriptorName, setDescriptorName] = useState('')
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<StatementNodeData | null>(null)

  const nodeTypes = useMemo(() => ({ statement: StatementNode, source: StatementNode }), [])

  useEffect(() => {
    if (!id) return
    getDataProduct(id)
      .then((desc) => {
        setDescriptorName(desc.name)

        const initialNodes: Node<StatementNodeData>[] = desc.nodes.map((n) => ({
          id: n.id,
          type: n.type === 'source' ? 'source' : 'statement',
          data: n,
          position: { x: 0, y: 0 },
        }))

        const initialEdges: Edge[] = desc.edges.map((e, idx) => ({
          id: `e-${idx}`,
          source: e.source,
          target: e.target,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }))

        const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(
          initialNodes,
          initialEdges,
          'LR'
        )

        setNodes(layoutNodes)
        setEdges(layoutEdges)
      })
      .catch(console.error)
  }, [id])

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/data-products" className="btn btn-secondary">
            <ArrowLeft size={16} /> All Products
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{descriptorName || id} Lineage Graph</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Interactive Flink SQL streaming pipeline DAG
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', height: '620px' }}>
        <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '0.5rem', background: '#ffffff', overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes as any}
            onNodeClick={(_, node) => setSelectedNode(node.data as StatementNodeData)}
            fitView
          >
            <Background color="#cbd5e1" gap={16} />
            <Controls />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="card" style={{ width: 360, margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedNode.label}</h3>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setSelectedNode(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div>
                <strong>Statement Name:</strong> <code>{selectedNode.statement_name || 'N/A'}</code>
              </div>
              <div>
                <strong>Kafka Topic:</strong> <code>{selectedNode.topic}</code>
              </div>
              <div>
                <strong>Table Materialization:</strong>{' '}
                <span className="badge badge-low">{selectedNode.table_type}</span>
              </div>
              {selectedNode.raw_sql && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <Code size={14} /> Deployed Flink SQL:
                  </div>
                  <pre
                    style={{
                      background: '#0f172a',
                      color: '#f8fafc',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.6875rem',
                      maxHeight: 250,
                      overflowY: 'auto',
                    }}
                  >
                    {selectedNode.raw_sql}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
