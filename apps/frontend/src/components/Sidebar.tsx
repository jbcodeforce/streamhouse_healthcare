import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Activity,
  Users,
  MapPin,
  Cpu,
  Link2,
  FileText,
  Radio,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Network,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: Activity },
  { to: '/analytics', label: 'Analytics & Lightning', icon: BarChart3 },
  { to: '/cep', label: 'CEP Scenarios', icon: AlertTriangle },
  { to: '/chat', label: 'AI Clinical Assistant', icon: MessageSquare },
  { to: '/data-products', label: 'Data Products & Lineage', icon: Network },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/care-areas', label: 'Care Areas', icon: MapPin },
  { to: '/devices', label: 'Medical Devices', icon: Cpu },
  { to: '/device-assignments', label: 'Assignments', icon: Link2 },
  { to: '/prescriptions', label: 'Prescriptions', icon: FileText },
  { to: '/telemetry', label: 'Vitals Telemetry', icon: Radio },
]

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Activity size={24} color="#3b82f6" />
        <span>Streamhouse HC</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.to === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#64748b' }}>
        <span>Confluent Cloud Streamhouse</span>
      </div>
    </aside>
  )
}
