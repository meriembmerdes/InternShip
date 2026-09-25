import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import type { Application } from '../../services/applicationService';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'REFUSEE':
        return 'Refusée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Mes candidatures
          </h1>
          <p className="mt-2 text-gray-500">
            Consultez l'état de vos candidatures aux offres de stage.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-700">
              Aucune candidature
            </h2>
            <p className="mt-2 text-gray-500">
              Vous n'avez pas encore postulé à une offre de stage.
            </p>
            <Link
              to="/student/internships"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Voir les offres
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {application.internship?.title || 'Offre de stage'}
                    </h2>

                    {application.internship?.domain && (
                      <p className="mt-1 text-gray-500">
                        Domaine : {application.internship.domain}
                      </p>
                    )}

                    {application.internship?.location && (
                      <p className="mt-1 text-gray-500">
                        Lieu : {application.internship.location}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-gray-400">
                      Candidature envoyée le{' '}
                      {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
                        application.status === 'EN_ATTENTE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : application.status === 'ACCEPTEE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {getStatusLabel(application.status)}
                    </span>
                  </div>
                </div>

                {application.motivationMessage && (
                  <div className="mt-5 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700">
                      Message de motivation
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {application.motivationMessage}
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <Link
                    to={`/student/internships/${application.internshipId}`}
                    className="text-blue-600 hover:underline"
                  >
                    Voir l'offre
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}