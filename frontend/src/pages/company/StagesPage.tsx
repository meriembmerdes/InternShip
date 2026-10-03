import { useEffect, useState } from 'react';
import {
  stageService,
  type Stage,
} from '../../services/stageService';

const getStatusLabel = (status: Stage['status']) => {
  switch (status) {
    case 'EN_ATTENTE':
      return 'En attente';

    case 'EN_COURS':
      return 'En cours';

    case 'TERMINE':
      return 'Terminé';

    case 'SUSPENDU':
      return 'Suspendu';

    default:
      return status;
  }
};

const getStatusClass = (status: Stage['status']) => {
  switch (status) {
    case 'EN_ATTENTE':
      return 'bg-yellow-100 text-yellow-700';

    case 'EN_COURS':
      return 'bg-blue-100 text-blue-700';

    case 'TERMINE':
      return 'bg-green-100 text-green-700';

    case 'SUSPENDU':
      return 'bg-red-100 text-red-700';

    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function CompanyStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingStage, setStartingStage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadStages = async () => {
    try {
      setLoading(true);

      const data = await stageService.getAll();

      setStages(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les stages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStages();
  }, []);

  const handleStartStage = async (stageId: string) => {
    const confirmed = window.confirm(
      'Voulez-vous démarrer ce stage ?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setStartingStage(stageId);
      setError('');

      await stageService.start(stageId);

      await loadStages();

      alert('Le stage a été démarré avec succès.');
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        'Impossible de démarrer le stage.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setStartingStage(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Chargement des stages...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Entreprise
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Stages
        </h1>

        <p className="mt-2 text-gray-500">
          Consultez et démarrez les stages de votre entreprise.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {stages.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Aucun stage disponible.
        </div>
      ) : (
        <div className="space-y-5">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {stage.internship?.title ||
                      'Stage sans titre'}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    {stage.student
                      ? `${stage.student.firstName} ${stage.student.lastName}`
                      : 'Étudiant non renseigné'}
                  </p>

                  <p className="text-sm text-gray-400">
                    {stage.internship?.domain ||
                      'Domaine non renseigné'}
                  </p>
                </div>

                <span
                  className={`h-fit w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    stage.status,
                  )}`}
                >
                  {getStatusLabel(stage.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Étudiant
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {stage.student
                      ? `${stage.student.firstName} ${stage.student.lastName}`
                      : 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Début
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {stage.startDate
                      ? new Date(
                          stage.startDate,
                        ).toLocaleDateString('fr-FR')
                      : 'Non défini'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Fin
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {stage.endDate
                      ? new Date(
                          stage.endDate,
                        ).toLocaleDateString('fr-FR')
                      : 'Non définie'}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-gray-600">
                    Progression
                  </span>

                  <span className="font-semibold text-gray-800">
                    {stage.progression}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(stage.progression, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {stage.status === 'EN_ATTENTE' && (
                <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-semibold text-yellow-800">
                    Stage en attente de démarrage
                  </p>

                  <p className="mt-1 text-sm text-yellow-700">
                    La candidature de l'étudiant a été
                    sélectionnée. Vous pouvez maintenant
                    démarrer le stage.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleStartStage(stage.id)
                    }
                    disabled={
                      startingStage === stage.id
                    }
                    className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {startingStage === stage.id
                      ? 'Démarrage...'
                      : '▶ Démarrer le stage'}
                  </button>
                </div>
              )}

              {stage.status === 'EN_COURS' && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-medium text-blue-800">
                    Stage en cours
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    Le stage est actuellement en cours.
                  </p>
                </div>
              )}

              {stage.status === 'TERMINE' && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-medium text-green-800">
                    Stage terminé
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Ce stage est terminé.
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
