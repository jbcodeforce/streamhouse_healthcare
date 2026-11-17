import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'

export function getLayoutedElements<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
  direction = 'LR'
): { nodes: Node<T>[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 240, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 120,
        y: nodeWithPosition.y - 40,
      },
    } as Node<T>
  })

  return { nodes: layoutedNodes, edges }
}
