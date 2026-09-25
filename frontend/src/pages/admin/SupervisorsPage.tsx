import { useEffect, useState } from 'react';
import {
  adminService,
  type AdminSupervisor,
} from '../../services/adminService';
import AdminPageLayout from '../../components/AdminPageLayout';
import AdminSearchBar from '../../components/AdminSearchBar';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<AdminSupervisor[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSupervisors = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSupervisors({
        search: search || undefined,
        department: department || undefined,
      });
      setSupervisors(data);
    } catch (error) {
      console.error('Erreur chargement encadrants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, []);

  const toggleStatus = async (supervisor: AdminSupervisor) => {
    try {
      const newStatus =
        supervisor.isActive === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      await adminService.updateSupervisorStatus(
        supervisor.id,
        newStatus,
      );

      setSupervisors(current =>
        current.map(item =>
          item.id === supervisor.id
            ? { ...item, isActive: newStatus }
            : item,
        ),
      );
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Impossible de modifier le statut.');
    }
  };

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Voulez-vous vraiment supprimer cet encadrant ?')) {
      return;
    }

    try {
      await adminService.deleteUser(id);
      setSupervisors(current =>
        current.filter(supervisor => supervisor.id !== id),
      );
    } catch (error) {
      console.error('Erreur suppression encadrant:', error);
      alert('Impossible de supprimer l’encadrant.');
    }
  }

  return (
  <AdminPageLayout
    title="Gestion des encadrants"
    description="Consultez et gérez les encadrants de la plateforme."
    count={supervisors.length}
    countLabel="encadrants"
  >
    <AdminSearchBar
      search={search}
      setSearch={setSearch}
      onSearch={loadSupervisors}
      placeholder="Rechercher un encadrant..."
    />

    {loading ? (
      <div className="admin-empty-state">
        Chargement des encadrants...
      </div>
    ) : supervisors.length === 0 ? (
      <div className="admin-empty-state">
        Aucun encadrant trouvé.
      </div>
    ) : (
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Encadrant</th>
              <th>Email</th>
              <th>Département</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {supervisors.map((supervisor) => (
              <tr key={supervisor.id}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-avatar">
                      {supervisor.firstName
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {supervisor.firstName}{' '}
                        {supervisor.lastName}
                      </strong>

                      <span>Encadrant</span>
                    </div>
                  </div>
                </td>

                <td>{supervisor.user?.email}</td>

                <td>
                  {supervisor.department || '—'}
                </td>

                <td>
                  <span className="admin-status active">
                    <span className="status-dot" />
                    Actif
                  </span>
                </td>

                <td>
                  {new Date(
                    supervisor.user?.createdAt
                  ).toLocaleDateString('fr-FR')}
                </td>

                <td>
                  <button
                    className="admin-delete-button"
                    onClick={() =>
                      handleDelete(supervisor.id)
                    }
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </AdminPageLayout>
);
}