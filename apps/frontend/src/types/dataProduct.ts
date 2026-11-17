export interface StatementNodeData extends Record<string, unknown> {
  id: string
  label: string
  type: 'source' | 'statement'
  statement_name: string
  topic: string
  table_type: string
  compute_pool_id: string
  is_product: boolean
  external: boolean
  raw_sql?: string
}

export interface StatementEdgeData {
  source: string
  target: string
}

export interface DataProductDescriptor {
  product_id: string
  name: string
  nodes: StatementNodeData[]
  edges: StatementEdgeData[]
}

export interface BillingCostItem {
  pool_name: string
  cfu: number
  monthly_cost_usd: number
}
