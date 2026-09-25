import { useEffect, useState } from 'react';
import { adminService, type AdminApplication } from '../../services/adminService';
import AdminPageLayout from '../../components/AdminPageLayout';

const statusLabels: Record<AdminApplication['status'], string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  ANNULEE: 'Annulée',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const data = await adminService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const changeStatus = async (
    id: string,
    status: AdminApplication['status'],
  ) => {
    try {
      await adminService.updateApplicationStatus(id, status);
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status } : app),
      );
    } catch (error) {
      console.error('Erreur modification statut:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des candidatures...</div>;
  }

  return (
  <AdminPageLayout
    title="Gestion des candidatures"
    description="Consultez et gérez les candidatures aux offres de stage."
  >
    {loading ? (
      <div className="empty-card">
        Chargement des candidatures…
      </div>
    ) : applications.length === 0 ? (
      <div className="empty-card">
        <strong>Aucune candidature trouvée</strong>
        <span>
          Aucune candidature n'est actuellement disponible.
        </span>
      </div>
    ) : (
      <div className="data-table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Stage</th>
                <th>Entreprise</th>
                <th>Motivation</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>

                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        {application.student.firstName
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {application.student.firstName}{' '}
                          {application.student.lastName}
                        </strong>

                        <span>
                          {application.student.specialty ||
                            application.student.institution ||
                            'Étudiant'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="table-primary-text">
                      {application.internship.title}
                    </div>

                    <div className="table-secondary-text">
                      {application.internship.domain || '—'}
                    </div>
                  </td>

                  <td>
                    <div className="table-primary-text">
                      {application.internship.company?.companyName ||
                        '—'}
                    </div>
                  </td>

                  <td className="motivation-cell">
                    {application.motivationMessage ? (
                      <span
                        title={application.motivationMessage}
                      >
                        {application.motivationMessage}
                      </span>
                    ) : (
                      <span className="table-secondary-text">
                        Aucune motivation
                      </span>
                    )}
                  </td>

                  <td>
                    {new Date(
                      application.appliedAt,
                    ).toLocaleDateString('fr-FR')}
                  </td>

                  <td>
                    <span
                      className={`status-badge application-status-${application.status.toLowerCase()}`}
                    >
                      {statusLabels[application.status]}
                    </span>
                  </td>

                  <td>
                    <select
                      value={application.status}
                      onChange={(e) =>
                        void changeStatus(
                          application.id,
                          e.target.value as AdminApplication['status'],
                        )
                      }
                      className="table-select"
                    >
                      <option value="EN_ATTENTE">
                        En attente
                      </option>

                      <option value="ACCEPTEE">
                        Acceptée
                      </option>

                      <option value="REFUSEE">
                        Refusée
                      </option>

                      <option value="ANNULEE">
                        Annulée
                      </option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </AdminPageLayout>
);
}