import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { ParticipantLayout } from "../layouts/ParticipantLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminLoginPage } from "../pages/auth/AdminLoginPage";
import { ParticipantLoginPage } from "../pages/auth/ParticipantLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { CreateEventPage } from "../pages/admin/CreateEventPage";
import { EventDetailsPage } from "../pages/admin/EventDetailsPage";
import { EventReportPage } from "../pages/admin/EventReportPage";
import { ManageEventsPage } from "../pages/admin/ManageEventsPage";
import { MessagesPage } from "../pages/admin/MessagesPage";
import { PaymentsPage } from "../pages/admin/PaymentsPage";
import { SettingsPage } from "../pages/admin/SettingsPage";
import { ParticipantDashboardPage } from "../pages/participant/ParticipantDashboardPage";
import { AboutPage } from "../pages/public/AboutPage";
import { FaqPage } from "../pages/public/FaqPage";
import { HomePage } from "../pages/public/HomePage";
import { ProgrammePage } from "../pages/public/ProgrammePage";
import { SpeakersPage } from "../pages/public/SpeakersPage";
import { SponsorshipPage } from "../pages/public/SponsorshipPage";
import { VenuePage } from "../pages/public/VenuePage";
import { RegisterConfirmationPage } from "../pages/registration/RegisterConfirmationPage";
import { RegisterDetailsPage } from "../pages/registration/RegisterDetailsPage";
import { RegisterParticipationPage } from "../pages/registration/RegisterParticipationPage";
import { RegisterPaymentPage } from "../pages/registration/RegisterPaymentPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="programme" element={<ProgrammePage />} />
        <Route path="speakers" element={<SpeakersPage />} />
        <Route path="sponsorship" element={<SponsorshipPage />} />
        <Route path="venue" element={<VenuePage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="register" element={<RegisterParticipationPage />} />
        <Route path="register/details" element={<RegisterDetailsPage />} />
        <Route path="register/payment" element={<RegisterPaymentPage />} />
        <Route path="register/confirmation" element={<RegisterConfirmationPage />} />
        <Route path="participant-login" element={<ParticipantLoginPage />} />
        <Route path="admin-login" element={<AdminLoginPage />} />
      </Route>

      <Route path="me" element={<ParticipantLayout />}>
        <Route index element={<ParticipantDashboardPage />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="events" element={<ManageEventsPage />} />
        <Route path="events/new" element={<CreateEventPage />} />
        <Route path="events/:id/reports" element={<EventReportPage />} />
        <Route path="events/:id/:tab" element={<EventDetailsPage />} />
        <Route path="events/:id" element={<Navigate to="overview" replace />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings/:section" element={<SettingsPage />} />
        <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
