import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleNavigation from '../components/RoleNavigation';
import {dashboardService,type DashboardStats,} from '../services/dashboard.service';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await dashboardService.getStats();

        if (isMounted) {
          setStats(data);
        }
      } catch (err: any) {
        if (!isMounted) {
          return;
        }

        const status = err?.response?.status;

        if (status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else if (status === 403) {
          setError('Accès interdit.');
        } else if (status === 500) {
          setError(
            'Une erreur serveur est survenue. Veuillez réessayer.',
          );
        } else {
          setError(
            err?.response?.data?.message ||
              'Impossible de charger les statistiques.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getTitle = () => {
    switch (role) {
      case 'STUDENT':
        return 'Espace étudiant';

      case 'COMPANY':
        return 'Espace entreprise';

      case 'SUPERVISOR':
        return 'Espace encadrant';

      case 'ADMIN':
        return 'Administration';

      default:
        return 'Tableau de bord';
    }
  };

  const getProfileCompletion = () => {
    if (!stats || !('profileCompletion' in stats)) {
      return null;
    }

    return stats.profileCompletion;
  };

  return (
    <div className="page-shell">
        <RoleNavigation />
        <header className="topbar">
        <div>
          <p className="eyebrow">Tableau de bord</p>

          <h1>
            Bienvenue, {user?.email ?? 'Utilisateur'}
          </h1>

          <p>{getTitle()}</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => void logout()}
        >
          Déconnexion
        </button>
      </header>

      {isLoading ? (
        <div className="message">
          Chargement des statistiques…
        </div>
      ) : null}

      {error ? (
        <div className="message error">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && stats ? (
        <div className="stats-grid">

          <div className="stat-card">
            <span>Rôle</span>
            <strong>{role ?? 'NON_DÉFINI'}</strong>
          </div>

          {getProfileCompletion() !== null ? (
            <div className="stat-card">
              <span>Profil</span>
              <strong>
                {getProfileCompletion()}%
              </strong>
            </div>
          ) : null}

          {stats.role === 'STUDENT' ? (
            <>
              <div className="stat-card">
                <span>Candidatures</span>
                <strong>
                  {stats.applicationsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Candidatures acceptées</span>
                <strong>
                  {stats.acceptedApplicationsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Stages</span>
                <strong>
                  {stats.internshipsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Notifications</span>
                <strong>
                  {stats.notificationsCount}
                </strong>
              </div>
              <button onClick={() =>navigate('/student/applications')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50">
                📄 Mes candidatures</button>
            </>
          ) : null}

          {stats.role === 'COMPANY' ? (
            <>
              <div className="stat-card">
                <span>Mes offres</span>
                <strong>
                  {stats.internshipsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Candidatures reçues</span>
                <strong>
                  {stats.applicationsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Candidatures acceptées</span>
                <strong>
                  {stats.acceptedApplicationsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Notifications</span>
                <strong>
                  {stats.notificationsCount}
                </strong>
              </div>
              <button onClick={() =>navigate('/student/internships')
                  }className="rounded-lg bg-blue-600 px-5 py-3 text-white">
                Consulter les offres de stage</button>
                <button onClick={()=>navigate('/company/applications')} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
                  📄 Candidatures reçues</button>
            </>
            
          ) : null}

          {stats.role === 'SUPERVISOR' ? (
            <>
              <div className="stat-card">
                <span>Stages suivis</span>
                <strong>
                  {stats.supervisedInternshipsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Étudiants suivis</span>
                <strong>
                  {stats.studentsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Évaluations</span>
                <strong>
                  {stats.evaluationsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Notifications</span>
                <strong>
                  {stats.notificationsCount}
                </strong>
              </div>
              <button onClick={()=>navigate('/supervisor/applications')} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
                📄 Candidatures reçues</button>
            </>
          ) : null}

          {stats.role === 'ADMIN' ? (
            <>
              <div className="stat-card">
                <span>Utilisateurs</span>
                <strong>
                  {stats.usersCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Étudiants</span>
                <strong>
                  {stats.studentsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Encadrants</span>
                <strong>
                  {stats.supervisorsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Entreprises</span>
                <strong>
                  {stats.companiesCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Offres / stages</span>
                <strong>
                  {stats.internshipsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Candidatures</span>
                <strong>
                  {stats.applicationsCount}
                </strong>
              </div>

              <div className="stat-card">
                <span>Notifications</span>
                <strong>
                  {stats.notificationsCount}
                </strong>
              </div>
            </>
          ) : null}

        </div>
      ) : null}

      {!isLoading && !error && !stats ? (
        <div className="message">
          Aucune statistique disponible.
        </div>
      ) : null}
    </div>
  );
}