import { useEffect, useState } from 'react';
import {
  adminService,
  type AdminStudent,
} from '../../services/adminService';
import AdminPageLayout from '../../components/AdminPageLayout';
import AdminSearchBar from '../../components/AdminSearchBar';

export default function StudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const data = await adminService.getStudents({
        search: search || undefined,
        specialty: specialty || undefined,
      });

      setStudents(data);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const toggleStatus = async (student: AdminStudent) => {
    try {
      const newStatus =
        student.isActive === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      await adminService.updateStudentStatus(student.id, newStatus);

      setStudents(current =>
        current.map(item =>
          item.id === student.id
            ? { ...item, isActive: newStatus }
            : item,
        ),
      );
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Impossible de modifier le statut.');
    }
  };

  return (
    <AdminPageLayout
      title="Gestion des étudiants"
      description="Gestion des étudiants inscrits dans la plateforme."
      count={students.length}
      countLabel="étudiants"
    >

      <AdminSearchBar
        search={search}
        setSearch={setSearch}
        onSearch={loadStudents}
        placeholder="Rechercher un étudiant..."
      />

      {loading ? (
        <div className="message">
          Chargement des étudiants...
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          Aucun étudiant trouvé.
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">

            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Email</th>
                <th>Classe</th>
                <th>Statut</th>
                <th>Date d'inscription</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map(student => (
                <tr key={student.id}>

                  <td>
                    <div className="admin-table-user">

                      <div className="admin-table-avatar">
                        {student.firstName
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {student.firstName}{' '}
                          {student.lastName}
                        </strong>

                        <span>
                          Étudiant
                        </span>
                      </div>

                    </div>
                  </td>

                  <td>
                    {student.email}
                  </td>

                  <td>
                    <span className="admin-badge admin-badge-blue">
                      {student.className || '—'}
                    </span>
                  </td>

                  <td>
                    <span className="admin-status active">
                      <span className="admin-status-dot" />
                      Actif
                    </span>
                  </td>

                  <td>
                    {student.createdAt
                      ? new Date(
                          student.createdAt,
                        ).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>

                  <td>
                    <div className="admin-actions">

                      <button className="admin-action-button">
                        Voir
                      </button>

                      <button className="admin-action-button">
                        Modifier
                      </button>

                    </div>
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