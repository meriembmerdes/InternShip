import { useEffect, useState } from 'react';
import {
  evaluationService,
  type Evaluation,
} from '../../services/evaluationService';
import { stageService, type Stage } from '../../services/stageService';

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'COMPANY_TO_STUDENT':
      return 'Évaluation de l’entreprise';
    case 'STUDENT_TO_COMPANY':
      return 'Mon évaluation de l’entreprise';
    case 'SUPERVISOR_TO_STUDENT':
      return 'Évaluation de l’encadrant';
    default:
      return 'Évaluation';
  }
};

const getStatusLabel = (status: string) => {
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

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACCEPTEE':
      return 'bg-green-100 text-green-700';
    case 'REFUSEE':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [stageId, setStageId] = useState('');
  const [comment, setComment] = useState('');
  const [criteria, setCriteria] = useState({
    travail: '',
    communication: '',
    ponctualite: '',
    environnement: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);

      const [evaluationData, stageData] = await Promise.all([
        evaluationService.getAll(),
        stageService.getAll(),
      ]);

      const allEvaluations: Evaluation[] = [
        ...(evaluationData.student || []),
        ...(evaluationData.company || []),
        ...(evaluationData.supervisor || []),
      ];

      allEvaluations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );

      setEvaluations(allEvaluations);
      setStages(stageData);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les évaluations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setStageId('');
    setComment('');
    setCriteria({
      travail: '',
      communication: '',
      ponctualite: '',
      environnement: '',
    });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stageId) {
      setError('Veuillez sélectionner un stage.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const criteriaData = {
        travail: criteria.travail,
        communication: criteria.communication,
        ponctualite: criteria.ponctualite,
        environnement: criteria.environnement,
      };

      if (editingId) {
        await evaluationService.updateStudent(editingId, {
          criteria: criteriaData,
          comment,
        });
      } else {
        /*
         * Le backend demande actuellement authorId.
         * Cette valeur sera récupérée depuis le stage étudiant.
         */
        const selectedStage = stages.find(
          (stage) => stage.id === stageId,
        );

        if (!selectedStage?.studentId) {
          setError('Impossible de déterminer l’étudiant.');
          return;
        }

        await evaluationService.createForStudent({
          stageId,
          authorId: selectedStage.studentId,
          criteria: criteriaData,
          comment,
        });
      }

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        'Une erreur est survenue lors de l’enregistrement de l’évaluation.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (evaluation: Evaluation) => {
    setEditingId(evaluation.id);
    setStageId(evaluation.stageId);

    setComment(evaluation.comment || '');

    setCriteria({
      travail: String(evaluation.criteria?.travail || ''),
      communication: String(
        evaluation.criteria?.communication || '',
      ),
      ponctualite: String(
        evaluation.criteria?.ponctualite || '',
      ),
      environnement: String(
        evaluation.criteria?.environnement || '',
      ),
    });

    setShowForm(true);
    setError('');
  };

 /* const studentEvaluations = evaluations.filter(
    (evaluation) => evaluation.type === 'STUDENT_TO_COMPANY',
  );*/

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Chargement des évaluations...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Mes évaluations
          </h1>

          <p className="mt-1 text-gray-500">
            Consultez et gérez les évaluations liées à vos stages.
          </p>
        </div>

        {stages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            + Ajouter une évaluation
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId
                  ? 'Modifier mon évaluation'
                  : 'Ajouter une évaluation'}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Évaluez votre expérience pendant le stage.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Stage
              </label>

              <select
                value={stageId}
                onChange={(event) => setStageId(event.target.value)}
                disabled={!!editingId}
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
              <h3 className="mb-3 font-semibold text-gray-800">
                Critères d’évaluation
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Travail
                  </label>

                  <select
                    value={criteria.travail}
                    onChange={(event) =>
                      setCriteria({
                        ...criteria,
                        travail: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-4 py-3"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Très satisfaisant">
                      Très satisfaisant
                    </option>
                    <option value="Satisfaisant">
                      Satisfaisant
                    </option>
                    <option value="Moyen">Moyen</option>
                    <option value="Insatisfaisant">
                      Insatisfaisant
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Communication
                  </label>

                  <select
                    value={criteria.communication}
                    onChange={(event) =>
                      setCriteria({
                        ...criteria,
                        communication: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-4 py-3"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Très satisfaisant">
                      Très satisfaisant
                    </option>
                    <option value="Satisfaisant">
                      Satisfaisant
                    </option>
                    <option value="Moyen">Moyen</option>
                    <option value="Insatisfaisant">
                      Insatisfaisant
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Ponctualité
                  </label>

                  <select
                    value={criteria.ponctualite}
                    onChange={(event) =>
                      setCriteria({
                        ...criteria,
                        ponctualite: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-4 py-3"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Très satisfaisant">
                      Très satisfaisant
                    </option>
                    <option value="Satisfaisant">
                      Satisfaisant
                    </option>
                    <option value="Moyen">Moyen</option>
                    <option value="Insatisfaisant">
                      Insatisfaisant
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Environnement de travail
                  </label>

                  <select
                    value={criteria.environnement}
                    onChange={(event) =>
                      setCriteria({
                        ...criteria,
                        environnement: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-4 py-3"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Très satisfaisant">
                      Très satisfaisant
                    </option>
                    <option value="Satisfaisant">
                      Satisfaisant
                    </option>
                    <option value="Moyen">Moyen</option>
                    <option value="Insatisfaisant">
                      Insatisfaisant
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Commentaire
              </label>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder="Ajoutez votre commentaire..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-lg border px-5 py-2.5 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? 'Enregistrement...'
                  : editingId
                    ? 'Enregistrer les modifications'
                    : 'Envoyer l’évaluation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            Aucune évaluation pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {evaluations.map((evaluation) => (
            <div
              key={`${evaluation.type}-${evaluation.id}`}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {evaluation.stage?.internship?.title || 'Stage'}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {getTypeLabel(evaluation.type)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    evaluation.status,
                  )}`}
                >
                  {getStatusLabel(evaluation.status)}
                </span>
              </div>

              {evaluation.stage?.company?.companyName && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Entreprise
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {evaluation.stage.company.companyName}
                  </p>
                </div>
              )}

              {evaluation.criteria &&
                Object.keys(evaluation.criteria).length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-3 font-semibold text-gray-800">
                      Critères
                    </h3>

                    <div className="grid gap-3 md:grid-cols-2">
                      {Object.entries(evaluation.criteria).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="rounded-lg border bg-gray-50 p-3"
                          >
                            <p className="text-sm text-gray-500">
                              {key}
                            </p>

                            <p className="mt-1 font-medium text-gray-800">
                              {String(value)}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {evaluation.comment && (
                <div className="mt-5">
                  <h3 className="mb-2 font-semibold text-gray-800">
                    Commentaire
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4 text-gray-700">
                    {evaluation.comment}
                  </div>
                </div>
              )}

              {evaluation.type === 'STUDENT_TO_COMPANY' && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleEdit(evaluation)}
                    className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Modifier mon évaluation
                  </button>
                </div>
              )}

              <div className="mt-5 border-t pt-4 text-sm text-gray-400">
                Créée le{' '}
                {new Date(evaluation.createdAt).toLocaleDateString(
                  'fr-FR',
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}