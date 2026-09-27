import { useEffect, useState } from 'react';
import { stageService, type Stage } from '../../services/stageService';

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

const formatDate = (date?: string) => {
  if (!date) return 'Non définie';

  return new Date(date).toLocaleDateString('fr-FR');
};

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStages = async () => {
      try {
        const data = await stageService.getAll();
        setStages(data);
      } catch (error) {
        console.error('Erreur chargement stages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStages();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Chargement des stages...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Mes stages
        </h1>

        <p className="mt-1 text-gray-500">
          Consultez vos stages, votre progression et les informations
          associées.
        </p>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            Aucun stage pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {stage.internship?.title || 'Stage'}
                  </h2>

                  {stage.internship?.domain && (
                    <p className="mt-1 text-gray-500">
                      Domaine : {stage.internship.domain}
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    stage.status,
                  )}`}
                >
                  {getStatusLabel(stage.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Entreprise</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {stage.company?.companyName || 'Non définie'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Encadrant</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {stage.supervisor
                      ? `${stage.supervisor.firstName} ${stage.supervisor.lastName}`
                      : 'Non défini'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Date de début</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(stage.startDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Date de fin</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(stage.endDate)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Progression du stage
                  </span>

                  <span className="font-semibold text-gray-800">
                    {stage.progression}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
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

              <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Statut du stage
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {getStatusLabel(stage.status)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Progression
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {stage.progression} %
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}