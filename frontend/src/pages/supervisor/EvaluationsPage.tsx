import { useEffect, useState } from 'react';
import api from '../../services/api';

type EvaluationStatus =
  | 'EN_ATTENTE'
  | 'ACCEPTEE'
  | 'REFUSEE';

interface Evaluation {
  id: string;
  stageId: string;
  authorId: string;
  type: string;
  criteria: Record<string, any>;
  comment?: string;
  status: EvaluationStatus;
  createdAt: string;

  stage?: {
    student?: {
      firstName: string;
      lastName: string;
    };
    internship?: {
      title: string;
      domain: string;
    };
  };
}

export default function SupervisorEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/evaluations');

      const supervisorEvaluations =
        data.supervisor || [];

      setEvaluations(supervisorEvaluations);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Impossible de charger les évaluations.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvaluations();
  }, []);

  const updateStatus = async (
    id: string,
    status: 'ACCEPTEE' | 'REFUSEE',
  ) => {
    try {
      setError('');
      setMessage('');

      await api.patch(`/evaluations/supervisor/${id}`, {
        status,
      });

      setMessage(
        status === 'ACCEPTEE'
          ? 'Évaluation acceptée avec succès.'
          : 'Évaluation refusée.',
      );

      await loadEvaluations();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Impossible de modifier le statut.',
      );
    }
  };

  const getStatusLabel = (
    status: EvaluationStatus,
  ) => {
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

  const getStatusClass = (
    status: EvaluationStatus,
  ) => {
    switch (status) {
      case 'ACCEPTEE':
        return 'bg-green-100 text-green-700';

      case 'REFUSEE':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Chargement des évaluations...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Gestion des évaluations
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Évaluations des étudiants
        </h1>

        <p className="mt-2 text-gray-500">
          Consultez les évaluations liées aux stages que
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

      {evaluations.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500 shadow-sm">
          Aucune évaluation disponible.
        </div>
      ) : (
        <div className="space-y-5">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {evaluation.stage?.student
                      ? `${evaluation.stage.student.firstName} ${evaluation.stage.student.lastName}`
                      : 'Étudiant non renseigné'}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    {evaluation.stage?.internship?.title ||
                      'Stage non renseigné'}
                  </p>

                  <p className="text-sm text-gray-400">
                    {evaluation.stage?.internship?.domain ||
                      ''}
                  </p>
                </div>

                <span
                  className={`h-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    evaluation.status,
                  )}`}
                >
                  {getStatusLabel(evaluation.status)}
                </span>
              </div>

              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-600">
                  Critères d'évaluation
                </p>

                <div className="space-y-2">
                  {Object.entries(
                    evaluation.criteria || {},
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-gray-200 pb-2 last:border-0"
                    >
                      <span className="text-gray-600">
                        {key}
                      </span>

                      <span className="font-medium text-gray-800">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {evaluation.comment && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">
                    Commentaire
                  </p>

                  <p className="mt-1 text-gray-700">
                    {evaluation.comment}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {evaluation.status === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(
                          evaluation.id,
                          'ACCEPTEE',
                        )
                      }
                      className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                    >
                      ✓ Accepter
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          evaluation.id,
                          'REFUSEE',
                        )
                      }
                      className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                    >
                      ✕ Refuser
                    </button>
                  </>
                )}
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Créée le{' '}
                {new Date(
                  evaluation.createdAt,
                ).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}