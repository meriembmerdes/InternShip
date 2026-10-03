import { useEffect, useState } from 'react';

import {
  stageService,
  type Stage,
} from '../../services/stageService';

import {
  taskService,
  type Task,
} from '../../services/taskService';

const getStatusLabel = (
  status: Stage['status'],
) => {
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

const getStatusClass = (
  status: Stage['status'],
) => {
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

const getTaskStatusLabel = (
  status: Task['status'],
) => {
  switch (status) {
    case 'A_FAIRE':
      return 'À faire';

    case 'EN_COURS':
      return 'En cours';

    case 'TERMINEE':
      return 'Terminée';

    default:
      return status;
  }
};

export default function SupervisorStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);

  const [tasks, setTasks] =
    useState<Record<string, Task[]>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [taskLoading, setTaskLoading] =
    useState<Record<string, boolean>>({});

  const [addingTask, setAddingTask] =
    useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] =
    useState('');

  const [newTaskDescription, setNewTaskDescription] =
    useState('');

  const [creatingTask, setCreatingTask] =
    useState(false);

  const [updatingTask, setUpdatingTask] =
    useState<string | null>(null);

  /**
   * Charger les tâches d'un stage
   */
  const loadTasks = async (
    stageId: string,
  ) => {
    try {
      setTaskLoading((prev) => ({
        ...prev,
        [stageId]: true,
      }));

      const data =
        await taskService.getByStage(
          stageId,
        );

      setTasks((prev) => ({
        ...prev,
        [stageId]: data,
      }));
    } catch (err) {
      console.error(
        `Erreur chargement tâches ${stageId}:`,
        err,
      );

      setTasks((prev) => ({
        ...prev,
        [stageId]: [],
      }));
    } finally {
      setTaskLoading((prev) => ({
        ...prev,
        [stageId]: false,
      }));
    }
  };

  /**
   * Charger les stages
   */
  const loadStages = async () => {
    try {
      setLoading(true);
      setError('');

      const data =
        await stageService.getAll();

      setStages(data);

      const taskResults =
        await Promise.all(
          data
            .filter(
              (stage) =>
                stage.status === 'EN_COURS',
            )
            .map(async (stage) => {
              try {
                const stageTasks =
                  await taskService.getByStage(
                    stage.id,
                  );

                return {
                  stageId: stage.id,
                  tasks: stageTasks,
                };
              } catch (err) {
                console.error(
                  `Erreur tâches ${stage.id}:`,
                  err,
                );

                return {
                  stageId: stage.id,
                  tasks: [],
                };
              }
            }),
        );

      const tasksMap: Record<
        string,
        Task[]
      > = {};

      taskResults.forEach((result) => {
        tasksMap[result.stageId] =
          result.tasks;
      });

      setTasks(tasksMap);
    } catch (err) {
      console.error(err);

      setError(
        'Impossible de charger les stages.',
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvrir le formulaire d'ajout
   */
  const handleOpenAddTask = (
    stageId: string,
  ) => {
    setAddingTask(stageId);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  /**
   * Annuler l'ajout
   */
  const handleCancelAddTask = () => {
    setAddingTask(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  /**
   * Ajouter une tâche
   */
  const handleCreateTask = async (
    stageId: string,
  ) => {
    if (!newTaskTitle.trim()) {
      alert(
        'Veuillez saisir le titre de la tâche.',
      );
      return;
    }

    try {
      setCreatingTask(true);

      await taskService.create({
        title: newTaskTitle.trim(),
        description:
          newTaskDescription.trim() || undefined,
        stageId,
      });

      await loadTasks(stageId);

      handleCancelAddTask();

      alert('Tâche ajoutée avec succès.');
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Impossible d'ajouter la tâche.",
      );
    } finally {
      setCreatingTask(false);
    }
  };

  /**
   * Modifier le statut d'une tâche
   */
  const handleTaskStatusChange = async (
    taskId: string,
    stageId: string,
    status: Task['status'],
  ) => {
    try {
      setUpdatingTask(taskId);

      await taskService.update(
        taskId,
        {
          status,
        },
      );

      await loadTasks(stageId);

      await loadStages();
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          'Impossible de modifier la tâche.',
      );
    } finally {
      setUpdatingTask(null);
    }
  };

  useEffect(() => {
    void loadStages();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Chargement des stages...
        </p>
      </div>
    );
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
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Encadrement
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Mes stages
        </h1>

        <p className="mt-2 text-gray-500">
          Suivi des stages des étudiants que vous
          encadrez.
        </p>
      </div>

      {/* AUCUN STAGE */}
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
              {/* HEADER DU STAGE */}
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
                    {stage.company?.companyName ||
                      'Entreprise non renseignée'}
                  </p>
                </div>

                <span
                  className={`h-fit w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    stage.status,
                  )}`}
                >
                  {getStatusLabel(
                    stage.status,
                  )}
                </span>
              </div>

              {/* INFORMATIONS */}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Domaine
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {stage.internship?.domain ||
                      'Non renseigné'}
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
                        ).toLocaleDateString(
                          'fr-FR',
                        )
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
                        ).toLocaleDateString(
                          'fr-FR',
                        )
                      : 'Non définie'}
                  </p>
                </div>
              </div>

              {/* PROGRESSION */}
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
                        Math.max(
                          stage.progression,
                          0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* TÂCHES */}
              {stage.status === 'EN_COURS' && (
                <div className="mt-6 border-t pt-6">
                  <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Tâches du stage
                      </h3>

                      <p className="text-sm text-gray-500">
                        Ajoutez et suivez les tâches
                        de l'étudiant.
                      </p>
                    </div>

                    {/* BOUTON AJOUTER */}
                    {addingTask !== stage.id && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenAddTask(
                            stage.id,
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        + Ajouter une tâche
                      </button>
                    )}
                  </div>

                  {/* FORMULAIRE AJOUT */}
                  {addingTask === stage.id && (
                    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
                      <h4 className="mb-4 text-lg font-semibold text-gray-800">
                        Nouvelle tâche
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Titre
                          </label>

                          <input
                            type="text"
                            value={
                              newTaskTitle
                            }
                            onChange={(e) =>
                              setNewTaskTitle(
                                e.target.value,
                              )
                            }
                            placeholder="Exemple : Développer la page de connexion"
                            className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            disabled={
                              creatingTask
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                          </label>

                          <textarea
                            value={
                              newTaskDescription
                            }
                            onChange={(e) =>
                              setNewTaskDescription(
                                e.target.value,
                              )
                            }
                            placeholder="Décrivez la tâche à réaliser..."
                            rows={4}
                            className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            disabled={
                              creatingTask
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={
                              handleCancelAddTask
                            }
                            disabled={
                              creatingTask
                            }
                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                          >
                            Annuler
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCreateTask(
                                stage.id,
                              )
                            }
                            disabled={
                              creatingTask
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {creatingTask
                              ? 'Ajout...'
                              : 'Ajouter la tâche'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LISTE DES TÂCHES */}
                  {taskLoading[stage.id] ? (
                    <p className="text-sm text-gray-500">
                      Chargement des tâches...
                    </p>
                  ) : !tasks[stage.id] ||
                    tasks[stage.id].length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Aucune tâche n'a encore
                        été ajoutée pour ce stage.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks[stage.id].map(
                        (task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border bg-gray-50 p-4"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {
                                      task.description
                                    }
                                  </p>
                                )}

                                <p className="mt-2 text-xs text-gray-500">
                                  Statut :{' '}
                                  {getTaskStatusLabel(
                                    task.status,
                                  )}
                                </p>

                                {task.completedAt && (
                                  <p className="mt-1 text-xs text-green-600">
                                    Terminée le{' '}
                                    {new Date(
                                      task.completedAt,
                                    ).toLocaleDateString(
                                      'fr-FR',
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* STATUT DE LA TÂCHE */}
                              <select
                                value={
                                  task.status
                                }
                                disabled={
                                  updatingTask ===
                                  task.id
                                }
                                onChange={(e) =>
                                  handleTaskStatusChange(
                                    task.id,
                                    stage.id,
                                    e.target
                                      .value as Task['status'],
                                  )
                                }
                                className="rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="A_FAIRE">
                                  À faire
                                </option>

                                <option value="EN_COURS">
                                  En cours
                                </option>

                                <option value="TERMINEE">
                                  Terminée
                                </option>
                              </select>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STATUT / PROGRESSION */}
              <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Statut du stage
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {getStatusLabel(
                      stage.status,
                    )}
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
