import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MyApplicationsPage from './pages/student/ApplicationsPage';
import InternshipsPage from './pages/student/InternshipPage';
import InternshipDetailsPage from './pages/student/InternshipDetailsPage';
import CompanyApplicationsPage from './pages/company/ApplicationsPage';
import SupervisorApplicationsPage from './pages/supervisor/ApplicationsPage';

import './App.css';
import ProfilePage from './pages/ProfilePage';
import ApplicationsPage from './pages/supervisor/ApplicationsPage';

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


          {/* =========================
              ÉTUDIANT
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route
              path="/student/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/student/profile"
              element={<ProfilePage />}
            />

            <Route
              path="/student/internships"
              element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
            <InternshipsPage />
            </ProtectedRoute>
              }
            />

            <Route path="/student/internships/:id"
            element={<ProtectedRoute allowedRoles={['STUDENT']}>
              <InternshipDetailsPage/></ProtectedRoute>}
              />

            <Route path="/student/applications" 
            element={<ProtectedRoute allowedRoles={['STUDENT']}>
              <ApplicationsPage/></ProtectedRoute>}/>

            <Route
              path="/student/notifications"
              element={<ComingSoonPage />}
            />
          </Route>


          {/* =========================
              ENCADRANT
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR']} />}>
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

            <Route
              path="/supervisor/notifications"
              element={<ComingSoonPage />}
            />
          </Route>


          {/* =========================
              ENTREPRISE
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
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

            <Route
              path="/company/notifications"
              element={<ComingSoonPage />}
            />
          </Route>


          {/* =========================
              ADMIN
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route
              path="/admin/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/admin/users"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/students"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/supervisors"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/companies"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/stages"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/applications"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/notifications"
              element={<ComingSoonPage />}
            />

            <Route
              path="/admin/settings"
              element={<ComingSoonPage />}
            />
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