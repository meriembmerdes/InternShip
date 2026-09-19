import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Role = 'ADMIN' | 'STUDENT' | 'SUPERVISOR' | 'COMPANY';

interface NavigationItem {
  label: string;
  path: string;
}

const navigationByRole: Record<Role, NavigationItem[]> = {
  STUDENT: [
    { label: 'Tableau de bord', path: '/student/dashboard' },
    { label: 'Mon profil', path: '/student/profile' },
    { label: 'Offres de stage', path: '/student/internships' },
    { label: 'Mes candidatures', path: '/student/applications' },
    { label: 'Mes stages', path: '/student/stages' },
    { label: 'Notifications', path: '/student/notifications' },
  ],

  SUPERVISOR: [
    { label: 'Tableau de bord', path: '/supervisor/dashboard' },
    { label: 'Mon profil', path: '/supervisor/profile' },
    { label: 'Mes étudiants', path: '/supervisor/students' },
    { label: 'Mes stages', path: '/supervisor/stages' },
    { label: 'Évaluations', path: '/supervisor/evaluations' },
    { label: 'Notifications', path: '/supervisor/notifications' },
  ],

  COMPANY: [
    { label: 'Tableau de bord', path: '/company/dashboard' },
    { label: 'Mon profil', path: '/company/profile' },
    { label: 'Mes offres', path: '/company/internships' },
    { label: 'Candidatures', path: '/company/applications' },
    { label: 'Stages', path: '/company/stages' },
    { label: 'Notifications', path: '/company/notifications' },
  ],

  ADMIN: [
    { label: 'Tableau de bord', path: '/admin/dashboard' },
    { label: 'Utilisateurs', path: '/admin/users' },
    { label: 'Étudiants', path: '/admin/students' },
    { label: 'Encadrants', path: '/admin/supervisors' },
    { label: 'Entreprises', path: '/admin/companies' },
    { label: 'Stages', path: '/admin/stages' },
    { label: 'Candidatures', path: '/admin/applications' },
    { label: 'Notifications', path: '/admin/notifications' },
    { label: 'Administration', path: '/admin/settings' },
  ],
};

export default function RoleNavigation() {
  const { user } = useAuth();

  if (!user) return null;

  const items = navigationByRole[user.role];

  if (!items) return null;

  return (
    <nav className="role-navigation">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive
              ? 'role-nav-link active'
              : 'role-nav-link'
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}