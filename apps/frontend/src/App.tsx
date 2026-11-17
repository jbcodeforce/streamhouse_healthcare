import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CepScenariosPage } from './pages/CepScenariosPage'
import { ChatPage } from './pages/ChatPage'
import { DataProductsPage } from './pages/DataProductsPage'
import { StatementGraphPage } from './pages/StatementGraphPage'
import { PatientsPage } from './pages/PatientsPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { PatientFormPage } from './pages/PatientFormPage'
import { CareAreasPage } from './pages/CareAreasPage'
import { CareAreaFormPage } from './pages/CareAreaFormPage'
import { DevicesPage } from './pages/DevicesPage'
import { DeviceFormPage } from './pages/DeviceFormPage'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { AssignmentFormPage } from './pages/AssignmentFormPage'
import { PrescriptionsPage } from './pages/PrescriptionsPage'
import { PrescriptionFormPage } from './pages/PrescriptionFormPage'
import { TelemetryPage } from './pages/TelemetryPage'
import { BulkGeneratePage } from './pages/BulkGeneratePage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/cep" element={<CepScenariosPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/data-products" element={<DataProductsPage />} />
          <Route path="/data-products/:id" element={<StatementGraphPage />} />

          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/new" element={<PatientFormPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/patients/:id/edit" element={<PatientFormPage />} />

          <Route path="/care-areas" element={<CareAreasPage />} />
          <Route path="/care-areas/new" element={<CareAreaFormPage />} />
          <Route path="/care-areas/:id/edit" element={<CareAreaFormPage />} />

          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/new" element={<DeviceFormPage />} />
          <Route path="/devices/:id/edit" element={<DeviceFormPage />} />

          <Route path="/device-assignments" element={<AssignmentsPage />} />
          <Route path="/device-assignments/new" element={<AssignmentFormPage />} />
          <Route path="/device-assignments/:id/edit" element={<AssignmentFormPage />} />

          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/prescriptions/new" element={<PrescriptionFormPage />} />
          <Route path="/prescriptions/:id/edit" element={<PrescriptionFormPage />} />

          <Route path="/telemetry" element={<TelemetryPage />} />
          <Route path="/telemetry/generate" element={<BulkGeneratePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
