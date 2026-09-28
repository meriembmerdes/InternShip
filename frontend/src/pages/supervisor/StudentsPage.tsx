import { useEffect, useState } from 'react';
import { stageService, type Stage } from '../../services/stageService';

export default function SupervisorStudentsPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await stageService.getAll();
        setStages(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les étudiants.');
      } finally {
        setLoading(false);
      }
    };

    void loadStudents();
  }, []);

  if (loading) {
    return <div className="p-6">Chargement des étudiants...</div>;
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
          Mes étudiants
        </h1>

        <p className="mt-2 text-gray-500">
          Liste des étudiants que vous encadrez.
        </p>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Aucun étudiant suivi pour le moment.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {stage.student
                  ? `${stage.student.firstName} ${stage.student.lastName}`
                  : 'Étudiant non renseigné'}
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-600">
                    Stage :
                  </span>{' '}
                  {stage.internship?.title || 'Non renseigné'}
                </p>

                <p>
                  <span className="font-medium text-gray-600">
                    Domaine :
                  </span>{' '}
                  {stage.internship?.domain || 'Non renseigné'}
                </p>

                <p>
                  <span className="font-medium text-gray-600">
                    Entreprise :
                  </span>{' '}
                  {stage.company?.companyName || 'Non renseignée'}
                </p>

                <p>
                  <span className="font-medium text-gray-600">
                    Statut :
                  </span>{' '}
                  {stage.status}
                </p>

                <p>
                  <span className="font-medium text-gray-600">
                    Progression :
                  </span>{' '}
                  {stage.progression}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}