import { useEffect, useState } from 'react';
import { reportService, type Report } from '../../services/reportService';
import { stageService, type Stage } from '../../services/stageService';

const getStatusLabel = (status: Report['status']) => {
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

const getStatusClass = (status: Report['status']) => {
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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [selectedStage, setSelectedStage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);

      const [reportsData, stagesData] = await Promise.all([
        reportService.getAll(),
        stageService.getAll(),
      ]);

      setReports(reportsData);
      setStages(stagesData);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les rapports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!selectedStage) {
      setError('Veuillez sélectionner un stage.');
      return;
    }

    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF.');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont autorisés.');
      return;
    }

    setUploading(true);

    try {
      await reportService.create(selectedStage, selectedFile);

      setSelectedStage('');
      setSelectedFile(null);

      const fileInput = document.getElementById(
        'report-file',
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = '';
      }

      setSuccess('Votre rapport a été déposé avec succès.');

      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        'Une erreur est survenue lors du dépôt du rapport.',
      );
    } finally {
      setUploading(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Mes rapports
        </h1>

        <p className="mt-1 text-gray-500">
          Déposez et consultez vos rapports de stage au format PDF.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold text-gray-800">
          Déposer un rapport
        </h2>

        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Stage
            </label>

            <select
              value={selectedStage}
              onChange={(event) =>
                setSelectedStage(event.target.value)
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Sélectionner un stage</option>

              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.internship?.title || 'Stage'} —{' '}
                  {stage.company?.companyName || 'Entreprise'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rapport PDF
            </label>

            <input
              id="report-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] || null)
              }
              className="block w-full rounded-lg border p-3 text-sm"
            />

            <p className="mt-2 text-xs text-gray-500">
              Format accepté : PDF.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Dépôt en cours...' : 'Déposer le rapport'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Mes rapports déposés
        </h2>

        {reports.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Aucun rapport déposé pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {report.stage?.internship?.title ||
                        'Rapport de stage'}
                    </h3>

                    {report.stage?.company?.companyName && (
                      <p className="mt-1 text-sm text-gray-500">
                        {report.stage.company.companyName}
                      </p>
                    )}
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                      report.status,
                    )}`}
                  >
                    {getStatusLabel(report.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Date de dépôt
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {report.submittedAt
                        ? new Date(
                            report.submittedAt,
                          ).toLocaleDateString('fr-FR')
                        : 'Non définie'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Statut
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {getStatusLabel(report.status)}
                    </p>
                  </div>
                </div>

                {report.comment && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-600">
                      Commentaire
                    </p>

                    <p className="mt-1 text-gray-800">
                      {report.comment}
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Consulter le rapport PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}