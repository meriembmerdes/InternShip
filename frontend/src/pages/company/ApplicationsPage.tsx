import { useEffect, useState } from 'react';
import { applicationService } from '../../services/applicationService';
import type { Application, ApplicationStatus } from '../../services/applicationService';

export default function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id: string, status: ApplicationStatus) => {
    try {
      setUpdating(id);
      const updated = await applicationService.updateStatus(id, status);

      setApplications((current) =>
        current.map((application) =>
          application.id === id ? { ...application, status: updated.status } : application
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const statusLabel = (status: string) => {
    if (status === 'EN_ATTENTE') return 'En attente';
    if (status === 'ACCEPTEE') return 'Acceptée';
    if (status === 'REFUSEE') return 'Refusée';
    return status;
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="message">
          <p>Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="message">
        <h1>Candidatures reçues</h1>
        <p>Consultez et gérez les candidatures aux offres de stage.</p>
      </div>

      {applications.length === 0 ? (
        <div className="message">
          <h2>Aucune candidature</h2>
          <p>Vous n'avez pas encore reçu de candidature.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <div
              key={application.id}
              className="application-card"
            >
              <div>
                <h2>
                  {application.internship?.title || 'Offre de stage'}
                </h2>

                <p>
                  Domaine : {application.internship?.domain || 'Non renseigné'}
                </p>

                <p>
                  Étudiant : {application.studentId}
                </p>

                <p>
                  Date de candidature :{' '}
                  {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div>
                <strong>
                  {statusLabel(application.status)}
                </strong>
              </div>

              {application.motivationMessage && (
                <div>
                  <h3>Message de motivation</h3>
                  <p>{application.motivationMessage}</p>
                </div>
              )}

              {application.status === 'EN_ATTENTE' && (
                <div>
                  <button
                    disabled={updating === application.id}
                    onClick={() =>
                      changeStatus(application.id, 'ACCEPTEE')
                    }
                  >
                    Accepter
                  </button>

                  <button
                    disabled={updating === application.id}
                    onClick={() =>
                      changeStatus(application.id, 'REFUSEE')
                    }
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}