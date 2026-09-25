import { useEffect, useState } from 'react';
import { evaluationService, type Evaluation } from '../../services/evaluationService';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await evaluationService.getAll();

        setEvaluations([
          ...(data.student || []),
          ...(data.company || []),
          ...(data.supervisor || []),
        ]);
      } catch (error) {
        console.error('Erreur chargement évaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Mes évaluations</h1>

      {evaluations.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          Aucune évaluation pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {evaluations.map((evaluation) => (
            <div
              key={`${evaluation.type}-${evaluation.id}`}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                {evaluation.stage?.internship?.title || 'Évaluation'}
              </h2>

              <p className="mt-2 text-gray-600">
                Type : {evaluation.type}
              </p>

              <p className="mt-2">
                Statut : <strong>{evaluation.status}</strong>
              </p>

              {evaluation.comment && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Commentaire</p>
                  <p className="mt-1">{evaluation.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}