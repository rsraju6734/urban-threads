import { Route, Routes } from 'react-router-dom'
import { StudioProvider } from '../../context/StudioContext'
import { StudioLayout } from '../../layouts/StudioLayout'
import OverviewPage from './OverviewPage'
import ClientsPage from './ClientsPage'
import ClientFormPage from './ClientFormPage'
import ClientPreviewPage from './ClientPreviewPage'
import GuidePage from './GuidePage'
import StudioNotFound from './StudioNotFound'

export default function StudioApp() {
  return (
    <StudioProvider>
      <Routes>
        <Route element={<StudioLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="new" element={<ClientFormPage />} />
          <Route path="edit/:id" element={<ClientFormPage />} />
          <Route path="client/:id" element={<ClientPreviewPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="*" element={<StudioNotFound />} />
        </Route>
      </Routes>
    </StudioProvider>
  )
}
