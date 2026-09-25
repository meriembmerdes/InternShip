import { useEffect, useState } from 'react';
import { adminService, type AdminStage } from '../../services/adminService';
import AdminPageLayout from '../../components/AdminPageLayout';

export default function StagePage() {
  const [stages, setStages] = useState<AdminStage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStages = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStages();
      setStages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStages();
  }, []);

  const getStatusLabel = (status: AdminStage['status']) => {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminé';
      case 'SUSPENDU':
        return 'Suspendu';
    }
  };

  return (
  <AdminPageLayout
    title="Gestion des stages"
    description="Consultez et suivez l'ensemble des stages."
  >
    {loading ? (
      <div className="empty-card">
        Chargement des stages…
      </div>
    ) : stages.length === 0 ? (
      <div className="empty-card">
        <strong>Aucun stage trouvé</strong>
        <span>
          Aucun stage n'est actuellement disponible.
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
                <th>Encadrant</th>
                <th>Statut</th>
                <th>Progression</th>
                <th>Période</th>
              </tr>
            </thead>

            <tbody>
              {stages.map((stage) => (
                <tr key={stage.id}>

                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        {stage.student?.firstName
                          ?.charAt(0)
                          .toUpperCase() || '?'}
                      </div>

                      <div>
                        <strong>
                          {stage.student?.firstName || '—'}{' '}
                          {stage.student?.lastName || ''}
                        </strong>

                        <span>
                          {stage.student?.specialty || 'Étudiant'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="table-primary-text">
                      {stage.internship?.title || '—'}
                    </div>

                    <div className="table-secondary-text">
                      {stage.internship?.domain || '—'}
                    </div>
                  </td>

                  <td>
                    <div className="table-primary-text">
                      {stage.company?.companyName || '—'}
                    </div>
                  </td>

                  <td>
                    {stage.supervisor ? (
                      <div className="table-user compact">
                        <div className="table-avatar small">
                          {stage.supervisor.firstName
                            ?.charAt(0)
                            .toUpperCase() || '?'}
                        </div>

                        <div>
                          <strong>
                            {stage.supervisor.firstName}{' '}
                            {stage.supervisor.lastName}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <span className="table-secondary-text">
                        Non affecté
                      </span>
                    )}
                  </td>

                  <td>
                    <span className="status-badge">
                      {getStatusLabel(stage.status)}
                    </span>
                  </td>

                  <td>
                    <div className="progress-wrapper">
                      <div className="progress-header">
                        <span>Progression</span>
                        <strong>{stage.progression}%</strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(
                              Math.max(stage.progression, 0),
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="date-cell">
                      <span>
                        Début :{' '}
                        {stage.startDate
                          ? new Date(
                              stage.startDate,
                            ).toLocaleDateString('fr-FR')
                          : '—'}
                      </span>

                      <span>
                        Fin :{' '}
                        {stage.endDate
                          ? new Date(
                              stage.endDate,
                            ).toLocaleDateString('fr-FR')
                          : '—'}
                      </span>
                    </div>
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