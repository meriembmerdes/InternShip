import { useEffect, useState } from 'react';
import {
  reportService,
  type Report,
} from '../../services/reportService';
import api from '../../services/api';

export default function SupervisorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await reportService.getAll();

      setReports(data);
    } catch (err: any) {
      console.error('Erreur chargement rapports:', err);

      setError(
        err?.response?.data?.message ||
          'Impossible de charger les rapports.',
      );
    } finally {
      setLoading(false);
    }
  };
  const handleOpenPdf = async (id: string) => {
  try {
    setError('');

    await reportService.openFile(id);
  } catch (error: any) {
    console.error(error);

    setError(
      error?.response?.data?.message ||
        'Impossible d’ouvrir le rapport PDF.',
    );
  }
};

  useEffect(() => {
    void loadReports();
  }, []);

  const updateStatus = async (
    id: string,
    status: 'VALIDE' | 'REFUSE',
  ) => {
    try {
      setError('');
      setMessage('');

      await api.patch(`/reports/${id}/status`, {
        status,
      });

      setMessage(
        status === 'VALIDE'
          ? 'Rapport accepté avec succès.'
          : 'Rapport refusé.',
      );

      await loadReports();
    } catch (err: any) {
      console.error('Erreur modification statut:', err);

      setError(
        err?.response?.data?.message ||
          'Impossible de modifier le statut.',
      );
    }
  };

  const getStatusLabel = (
    status: Report['status'],
  ) => {
    switch (status) {
      case 'NON_DEPOSE':
        return 'Non déposé';

      case 'DEPOSE':
        return 'Déposé';

      case 'EN_REVISION':
        return 'En révision';

      case 'VALIDE':
        return 'Validé';

      case 'REFUSE':
        return 'Refusé';

      default:
        return status;
    }
  };

  const getStatusClass = (
    status: Report['status'],
  ) => {
    switch (status) {
      case 'VALIDE':
        return 'bg-green-100 text-green-700';

      case 'REFUSE':
        return 'bg-red-100 text-red-700';

      case 'EN_REVISION':
        return 'bg-blue-100 text-blue-700';

      case 'DEPOSE':
        return 'bg-yellow-100 text-yellow-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Chargement des rapports...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Gestion des rapports
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Rapports des étudiants
        </h1>

        <p className="mt-2 text-gray-500">
          Consultez et validez les rapports des étudiants
          que vous encadrez.
        </p>
      </div>

      {/* MESSAGE SUCCÈS */}
      {message && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </div>
      )}

      {/* MESSAGE ERREUR */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {/* RAPPORTS */}
      {reports.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Aucun rapport disponible.
        </div>
      ) : (
        <div className="space-y-5">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              {/* INFORMATIONS */}
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {report.student
                      ? `${report.student.firstName} ${report.student.lastName}`
                      : 'Étudiant non renseigné'}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    {report.stage?.internship?.title ||
                      'Stage non renseigné'}
                  </p>

                  {report.stage?.internship?.domain && (
                    <p className="text-sm text-gray-400">
                      {report.stage.internship.domain}
                    </p>
                  )}
                </div>

                {/* STATUT */}
                <span
                  className={`h-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    report.status,
                  )}`}
                >
                  {getStatusLabel(report.status)}
                </span>
              </div>

              {/* DATE */}
              <div className="mt-5">
                <p className="text-sm text-gray-500">
                  Date de dépôt
                </p>

                <p className="font-medium text-gray-700">
                  {report.submittedAt
                    ? new Date(
                        report.submittedAt,
                      ).toLocaleDateString('fr-FR')
                    : 'Non renseignée'}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-wrap gap-3">
                {report.fileUrl && (
                  <button
                  type="button"
                    onClick={() => void handleOpenPdf(report.id)}
                  >📄 Voir le PDF
                  </button>
                )}

                {(report.status === 'DEPOSE' ||
                  report.status === 'EN_REVISION') && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(
                          report.id,
                          'VALIDE',
                        )
                      }
                      className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                    >
                      ✓ Accepter
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          report.id,
                          'REFUSE',
                        )
                      }
                      className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                    >
                      ✕ Refuser
                    </button>
                  </>
                )}
              </div>

              {/* COMMENTAIRE */}
              {report.comment && (
                <div className="mt-5 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Commentaire
                  </p>

                  <p className="mt-1 text-gray-700">
                    {report.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}