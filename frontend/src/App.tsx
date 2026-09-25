import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import StagesPage from './pages/student/StagesPage';
import InternshipsPage from './pages/student/InternshipPage';
import ReportsPage from './pages/student/ReportsPage';
import EvaluationsPage from './pages/student/EvaluationsPage';
import InternshipDetailsPage from './pages/student/InternshipDetailsPage';
import CompanyApplicationsPage from './pages/company/ApplicationsPage';
import SupervisorApplicationsPage from './pages/supervisor/ApplicationsPage';
import UsersPage from './pages/admin/UsersPage';
import StudentsPage from './pages/admin/StudentsPage';
import SupervisorsPage from './pages/admin/SupervisorsPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import StagePage from './pages/admin/StagePage';
import AdminApplicationsPage from './pages/admin/ApplicationsPage';
import AppLayout from './components/AppLayout';

import './App.css';
import ProfilePage from './pages/ProfilePage';

function ComingSoonPage() {
  return (
    <div className="page-shell centered">
      <div className="message">
        <h2>Fonctionnalité en cours de développement</h2>
        <p>Cette partie d'InternFlow sera disponible dans une prochaine étape.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              ROUTES PUBLIQUES
          ========================== */}

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />


          {/*ÉTUDIANT*/}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route element={<AppLayout />}>
          <Route path="/student/dashboard" element={<DashboardPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/internships" element={<InternshipsPage />} />
          <Route path="/student/internships/:id" element={<InternshipDetailsPage />} />
          <Route path="/student/applications" element={<MyApplicationsPage />} />
          <Route path="/student/stages" element={<StagesPage />} />
          <Route path="/student/reports" element={<ReportsPage />} />
          <Route path="/student/evaluations" element={<EvaluationsPage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
          </Route>
          </Route>


          {/* =========================
              ENCADRANT
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR']} />}>
            <Route element={<AppLayout />}>
            <Route
              path="/supervisor/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/supervisor/profile"
              element={<ProfilePage />}
            />

            <Route
              path="/supervisor/students"
              element={<ComingSoonPage />}
            />
            <Route path="/supervisor/applications" 
            element={<SupervisorApplicationsPage/>}/>

            <Route
              path="/supervisor/stages"
              element={<ComingSoonPage />}
            />

            <Route
              path="/supervisor/evaluations"
              element={<ComingSoonPage />}
            />
            <Route path="/supervisor/notifications" element={<NotificationsPage />} />
          </Route>
          </Route>

            


          {/* =========================
              ENTREPRISE
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
          <Route element={<AppLayout />}>
            <Route
              path="/company/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/company/profile"
              element={<ProfilePage />}
            />

            <Route
              path="/company/internships"
              element={<ComingSoonPage />}
            />

            <Route path="/company/applications" 
            element={<CompanyApplicationsPage/>}/>

            <Route
              path="/company/stages"
              element={<ComingSoonPage />}
            />
            <Route path="/company/notifications" element={<NotificationsPage />} />
          </Route>
          </Route>


          {/* =========================
              ADMIN
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AppLayout />}>
            <Route
              path="/admin/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/admin/users"
              element={<UsersPage />}
            />

            <Route
              path="/admin/students"
              element={<StudentsPage />}
            />

            <Route
              path="/admin/supervisors"
              element={<SupervisorsPage />}
            />

            <Route
              path="/admin/companies"
              element={<CompaniesPage />}
            />


            <Route
              path="/admin/applications"
              element={<AdminApplicationsPage />}
            />

            <Route path="/admin/notifications" 
              element={<NotificationsPage />} />

            <Route
              path="/admin/settings"
              element={<ComingSoonPage />}
            />
            <Route
              path="/admin/stages"
              element={<StagePage />}
            />
          </Route>
          </Route>


          {/* =========================
              ROUTE INCONNUE
          ========================== */}

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}