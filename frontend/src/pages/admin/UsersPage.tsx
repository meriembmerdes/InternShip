import { useEffect, useState } from 'react';
import { adminService, type AdminUser, type Role } from '../../services/adminService';
import AdminPageLayout from '../../components/AdminPageLayout';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({
        search: search || undefined,
        role: role || undefined,
      });
      setUsers(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role]);

  const getName = (user: AdminUser) => {
    if (user.student) {
      return `${user.student.firstName} ${user.student.lastName}`;
    }

    if (user.supervisor) {
      return `${user.supervisor.firstName} ${user.supervisor.lastName}`;
    }

    if (user.company) {
      return user.company.companyName;
    }

    return 'Administrateur';
  };

  const handleDelete = async (id: string, userRole: Role) => {
    if (userRole === 'ADMIN') return;

    if (!window.confirm('Supprimer cet utilisateur ?')) return;

    try {
      await adminService.deleteUser(id);
      setUsers(current => current.filter(user => user.id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Impossible de supprimer cet utilisateur.');
    }
  };

  return (
  <AdminPageLayout
    title="Gestion des utilisateurs"
    description="Gérez les étudiants, encadrants, entreprises et administrateurs."
  >
    <div className="admin-toolbar">

      <div className="admin-search">
        <span className="admin-search-icon">⌕</span>

        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              void loadUsers();
            }
          }}
        />
      </div>

      <select
        value={role}
        onChange={(e) =>
          setRole(e.target.value as Role | '')
        }
        className="admin-filter"
      >
        <option value="">Tous les rôles</option>
        <option value="STUDENT">Étudiants</option>
        <option value="SUPERVISOR">Encadrants</option>
        <option value="COMPANY">Entreprises</option>
        <option value="ADMIN">Administrateurs</option>
      </select>

      <button
        onClick={() => void loadUsers()}
        className="primary-button"
      >
        Rechercher
      </button>

    </div>

    {loading ? (
      <div className="empty-card">
        Chargement des utilisateurs…
      </div>
    ) : users.length === 0 ? (
      <div className="empty-card">
        <strong>Aucun utilisateur trouvé</strong>

        <span>
          Aucun utilisateur ne correspond à votre recherche.
        </span>
      </div>
    ) : (
      <div className="data-table-card">
        <div className="table-scroll">
          <table className="data-table">

            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date d'inscription</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {

                const name = getName(user);

                return (
                  <tr key={user.id}>

                    <td>
                      <div className="table-user">

                        <div className="table-avatar">
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{name}</strong>

                          <span>
                            {user.role === 'STUDENT'
                              ? 'Étudiant'
                              : user.role === 'SUPERVISOR'
                              ? 'Encadrant'
                              : user.role === 'COMPANY'
                              ? 'Entreprise'
                              : 'Administrateur'}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td className="email-cell">
                      {user.email}
                    </td>

                    <td>
                      <span
                        className={`role-badge role-${user.role.toLowerCase()}`}
                      >
                        {user.role === 'STUDENT'
                          ? 'Étudiant'
                          : user.role === 'SUPERVISOR'
                          ? 'Encadrant'
                          : user.role === 'COMPANY'
                          ? 'Entreprise'
                          : 'Administrateur'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.isActive === 'ACTIVE'
                            ? 'status-badge active'
                            : 'status-badge inactive'
                        }
                      >
                        <span className="status-dot" />

                        {user.isActive === 'ACTIVE'
                          ? 'Actif'
                          : 'Inactif'}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.createdAt,
                      ).toLocaleDateString('fr-FR')}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          void handleDelete(
                            user.id,
                            user.role,
                          )
                        }
                        disabled={user.role === 'ADMIN'}
                        className="danger-button"
                      >
                        Supprimer
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>
    )}
  </AdminPageLayout>
);
}