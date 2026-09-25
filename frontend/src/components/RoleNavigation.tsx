import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type NavigationItem = {
  label: string;
  path: string;
  icon: string;
};

const navigationByRole: Record<string, NavigationItem[]> = {
  STUDENT: [
    {
      label: 'Tableau de bord',
      path: '/student/dashboard',
      icon: '⌂',
    },
    {
      label: 'Mon profil',
      path: '/student/profile',
      icon: '◉',
    },
    {
      label: 'Offres de stage',
      path: '/student/internships',
      icon: '▣',
    },
    {
      label: 'Mes candidatures',
      path: '/student/applications',
      icon: '▤',
    },
    {
      label: 'Mes stages',
      path: '/student/stages',
      icon: '◆',
    },
    {
      label: 'Mes rapports',
      path: '/student/reports',
      icon: '▧',
    },
    {
      label: 'Évaluations',
      path: '/student/evaluations',
      icon: '★',
    },
    {
      label: 'Notifications',
      path: '/student/notifications',
      icon: '●',
    },
  ],

  SUPERVISOR: [
    {
      label: 'Tableau de bord',
      path: '/supervisor/dashboard',
      icon: '⌂',
    },
    {
      label: 'Mon profil',
      path: '/supervisor/profile',
      icon: '◉',
    },
    {
      label: 'Étudiants',
      path: '/supervisor/students',
      icon: '♟',
    },
    {
      label: 'Candidatures',
      path: '/supervisor/applications',
      icon: '▤',
    },
    {
      label: 'Stages',
      path: '/supervisor/stages',
      icon: '◆',
    },
    {
      label: 'Évaluations',
      path: '/supervisor/evaluations',
      icon: '★',
    },
    {
      label: 'Notifications',
      path: '/supervisor/notifications',
      icon: '●',
    },
  ],

  COMPANY: [
    {
      label: 'Tableau de bord',
      path: '/company/dashboard',
      icon: '⌂',
    },
    {
      label: 'Mon profil',
      path: '/company/profile',
      icon: '◉',
    },
    {
      label: 'Mes offres',
      path: '/company/internships',
      icon: '▣',
    },
    {
      label: 'Candidatures',
      path: '/company/applications',
      icon: '▤',
    },
    {
      label: 'Stages',
      path: '/company/stages',
      icon: '◆',
    },
    {
      label: 'Notifications',
      path: '/company/notifications',
      icon: '●',
    },
  ],

  ADMIN: [
    {
      label: 'Tableau de bord',
      path: '/admin/dashboard',
      icon: '⌂',
    },
    {
      label: 'Utilisateurs',
      path: '/admin/users',
      icon: '♟',
    },
    {
      label: 'Étudiants',
      path: '/admin/students',
      icon: '◉',
    },
    {
      label: 'Encadrants',
      path: '/admin/supervisors',
      icon: '◆',
    },
    {
      label: 'Entreprises',
      path: '/admin/companies',
      icon: '▣',
    },
    {
      label: 'Candidatures',
      path: '/admin/applications',
      icon: '▤',
    },
    {
      label: 'Stages',
      path: '/admin/stages',
      icon: '▧',
    },
    {
      label: 'Notifications',
      path: '/admin/notifications',
      icon: '●',
    },
    {
      label: 'Administration',
      path: '/admin/settings',
      icon: '⚙',
    },
  ],
};

function getRoleLabel(role?: string) {
  switch (role) {
    case 'STUDENT':
      return 'Espace étudiant';

    case 'SUPERVISOR':
      return 'Espace encadrant';

    case 'COMPANY':
      return 'Espace entreprise';

    case 'ADMIN':
      return 'Espace administrateur';

    default:
      return 'Espace InternFlow';
  }
}

export default function RoleNavigation() {
  const { user, logout } = useAuth();

  const items = navigationByRole[user?.role ?? ''] ?? [];

  const userData = user as any;

function getUserDisplayName(user: any) {
  if (!user) {
    return 'Utilisateur';
  }

  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');
  }

  if (user.student) {
    return [
      user.student.firstName,
      user.student.lastName,
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (user.supervisor) {
    return [
      user.supervisor.firstName,
      user.supervisor.lastName,
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (user.company?.companyName) {
    return user.company.companyName;
  }

  return 'Utilisateur';
}
const fullName = getUserDisplayName(user);
const initial = fullName.charAt(0).toUpperCase();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">IF</div>

        <div>
          <strong>InternFlow</strong>
          <span>Gestion des stages</span>
        </div>
      </div>

      <div className="sidebar-role">
        {getRoleLabel(user?.role)}
      </div>

      <nav className="sidebar-menu">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? 'active' : ''
              }`
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {initial}
          </div>

          <div className="user-details">
            <strong>{fullName}</strong>

            <span>{user?.email}</span>
          </div>
        </div>

        <button
          className="sidebar-logout"
          onClick={() => void logout()}
        >
          ↪ Déconnexion
        </button>
      </div>
    </aside>
  );
}