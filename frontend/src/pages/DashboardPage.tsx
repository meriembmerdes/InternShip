import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import {
  dashboardService,
  type DashboardStats,
} from '../services/dashboard.service';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const role = user?.role;

  const userData = user as any;

const getUserName = () => {
  if (!user) {
    return 'Utilisateur';
  }

  // Nom directement présent dans AuthUser
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');
  }

  // Étudiant
  if (user.student) {
    return [
      user.student.firstName,
      user.student.lastName,
    ]
      .filter(Boolean)
      .join(' ');
  }

  // Encadrant
  if (user.supervisor) {
    return [
      user.supervisor.firstName,
      user.supervisor.lastName,
    ]
      .filter(Boolean)
      .join(' ');
  }

  // Entreprise
  if (user.company?.companyName) {
    return user.company.companyName;
  }

  return 'Utilisateur';
};

const fullName = getUserName();

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
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">TABLEAU DE BORD</p>

            <h1>
            Bienvenue,{' '}
          {[
            user?.firstName,
            user?.lastName,
            ]
    .filter(Boolean)
    .join(' ') || 'Utilisateur'} 👋
</h1>

            <p className="dashboard-subtitle">
              {getTitle()}
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="message">
            Chargement des statistiques…
          </div>
        )}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {!isLoading && !error && stats && (
          <div className="stats-grid">

            <div className="stat-card">
              <span>Rôle</span>
              <strong>{role ?? 'NON_DÉFINI'}</strong>
            </div>

            {getProfileCompletion() !== null && (
              <div className="stat-card">
                <span>Profil</span>
                <strong>
                  {getProfileCompletion()}%
                </strong>
              </div>
            )}

            {stats.role === 'STUDENT' && (
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

                <button
                  onClick={() =>
                    navigate('/student/applications')
                  }
                  className="primary-button"
                >
                  📄 Mes candidatures
                </button>
              </>
            )}

            {stats.role === 'COMPANY' && (
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

                <button
                  onClick={() =>
                    navigate('/company/internships')
                  }
                  className="primary-button"
                >
                  Consulter mes offres
                </button>

                <button
                  onClick={() =>
                    navigate('/company/applications')
                  }
                  className="primary-button"
                >
                  📄 Candidatures reçues
                </button>
              </>
            )}

            {stats.role === 'SUPERVISOR' && (
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

                <button
                  onClick={() =>
                    navigate('/supervisor/applications')
                  }
                  className="primary-button"
                >
                  📄 Candidatures
                </button>
              </>
            )}

            {stats.role === 'ADMIN' && (
              <>
                <div className="stat-card">
                  <span>Utilisateurs</span>
                  <strong>{stats.usersCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Étudiants</span>
                  <strong>{stats.studentsCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Encadrants</span>
                  <strong>{stats.supervisorsCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Entreprises</span>
                  <strong>{stats.companiesCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Offres / stages</span>
                  <strong>{stats.internshipsCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Candidatures</span>
                  <strong>{stats.applicationsCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Notifications</span>
                  <strong>{stats.notificationsCount}</strong>
                </div>
              </>
            )}
          </div>
        )}

        {!isLoading && !error && !stats && (
          <div className="message">
            Aucune statistique disponible.
          </div>
        )}
      </main>
    
  );
}