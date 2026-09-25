import { useEffect, useState } from 'react';
import { reportService, type Report } from '../../services/reportService';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await reportService.getAll();
        setReports(data);
      } catch (error) {
        console.error('Erreur chargement rapports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Mes rapports</h1>

      {reports.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          Aucun rapport pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                {report.stage?.internship?.title || 'Rapport de stage'}
              </h2>

              <p className="mt-2 text-gray-600">
                {report.stage?.company?.companyName || 'Entreprise non définie'}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <span className="text-sm text-gray-500">Statut</span>
                  <p className="font-medium">{report.status}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Date de dépôt</span>
                  <p className="font-medium">
                    {report.submittedAt
                      ? new Date(report.submittedAt).toLocaleDateString('fr-FR')
                      : 'Non déposée'}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Encadrant</span>
                  <p className="font-medium">
                    {report.stage?.supervisor
                      ? `${report.stage.supervisor.firstName} ${report.stage.supervisor.lastName}`
                      : 'Non défini'}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Consulter le rapport
                </a>
              </div>

              {report.comment && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Commentaire</p>
                  <p className="mt-1">{report.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}