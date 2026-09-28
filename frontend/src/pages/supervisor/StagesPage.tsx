import { useEffect, useState } from 'react';
import { stageService, type Stage } from '../../services/stageService';

export default function SupervisorStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStages = async () => {
      try {
        const data = await stageService.getAll();
        setStages(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les stages.');
      } finally {
        setLoading(false);
      }
    };

    void loadStages();
  }, []);

  if (loading) {
    return <div className="p-6">Chargement des stages...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Encadrement
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Mes stages
        </h1>

        <p className="mt-2 text-gray-500">
          Suivi des stages des étudiants que vous encadrez.
        </p>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Aucun stage à afficher.
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
                    {stage.internship?.title || 'Stage sans titre'}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    {stage.student
                      ? `${stage.student.firstName} ${stage.student.lastName}`
                      : 'Étudiant non renseigné'}
                  </p>

                  <p className="text-sm text-gray-400">
                    {stage.company?.companyName || 'Entreprise non renseignée'}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {stage.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Domaine</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {stage.internship?.domain || 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Début</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {stage.startDate
                      ? new Date(stage.startDate).toLocaleDateString('fr-FR')
                      : 'Non défini'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Fin</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {stage.endDate
                      ? new Date(stage.endDate).toLocaleDateString('fr-FR')
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
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${stage.progression}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}