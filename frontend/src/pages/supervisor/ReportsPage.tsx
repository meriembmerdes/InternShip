import { useEffect, useState } from 'react';
import api from '../../services/api';

type ReportStatus =
  | 'NON_DEPOSE'
  | 'DEPOSE'
  | 'EN_REVISION'
  | 'VALIDE'
  | 'REFUSE';

interface Report {
  id: string;
  fileUrl: string;
  submittedAt?: string;
  status: ReportStatus;
  comment?: string;

  student?: {
    firstName: string;
    lastName: string;
  };

  stage?: {
    internship?: {
      title: string;
      domain: string;
    };
  };
}

export default function SupervisorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get<Report[]>('/reports');

      setReports(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Impossible de charger les rapports.',
      );
    } finally {
      setLoading(false);
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
      setError(
        err?.response?.data?.message ||
          'Impossible de modifier le statut.',
      );
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
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

  const getStatusClass = (status: ReportStatus) => {
    switch (status) {
      case 'VALIDE':
        return 'bg-green-100 text-green-700';
      case 'REFUSE':
        return 'bg-red-100 text-red-700';
      case 'EN_REVISION':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Chargement des rapports...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Gestion des rapports
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Rapports des étudiants
        </h1>

        <p className="mt-2 text-gray-500">
          Consultez et validez les rapports des étudiants que
          vous encadrez.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

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

                  <p className="text-sm text-gray-400">
                    {report.stage?.internship?.domain ||
                      ''}
                  </p>
                </div>

                <span
                  className={`h-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    report.status,
                  )}`}
                >
                  {getStatusLabel(report.status)}
                </span>
              </div>

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

              <div className="mt-6 flex flex-wrap gap-3">
                {report.fileUrl && (
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                  >
                    📄 Voir le PDF
                  </a>
                )}

                {(report.status === 'DEPOSE' ||
                  report.status === 'EN_REVISION') && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(report.id, 'VALIDE')
                      }
                      className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                    >
                      ✓ Accepter
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(report.id, 'REFUSE')
                      }
                      className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                    >
                      ✕ Refuser
                    </button>
                  </>
                )}
              </div>

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