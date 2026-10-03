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

const formatDate = (
  date?: string,
) => {
  if (!date) {
    return 'Non définie';
  }

  return new Date(date).toLocaleDateString(
    'fr-FR',
  );
};

export default function StagesPage() {
  const [stages, setStages] =
    useState<Stage[]>([]);

  const [tasks, setTasks] =
    useState<Record<string, Task[]>>({});

  const [taskLoading, setTaskLoading] =
    useState<Record<string, boolean>>({});

  const [loading, setLoading] =
    useState(true);

  const [updatingTask, setUpdatingTask] =
    useState<string | null>(null);

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
    } catch (error) {
      console.error(
        'Erreur chargement tâches:',
        error,
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

  const loadStages = async () => {
    try {
      setLoading(true);

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
              } catch (error) {
                console.error(
                  `Erreur chargement tâches ${stage.id}:`,
                  error,
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
    } catch (error) {
      console.error(
        'Erreur chargement des stages:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

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

      const updatedStages =
        await stageService.getAll();

      setStages(updatedStages);
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          'Impossible de modifier la tâche.',
      );
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleFinishStage = async (
    stageId: string,
  ) => {
    const confirmed =
      window.confirm(
        'Voulez-vous vraiment terminer ce stage ?',
      );

    if (!confirmed) {
      return;
    }

    try {
      await stageService.finish(
        stageId,
      );

      await loadStages();

      alert(
        'Votre stage est maintenant terminé.',
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          'Impossible de terminer le stage.',
      );
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Mes stages
        </h1>

        <p className="mt-1 text-gray-500">
          Consultez vos stages, votre progression
          et les tâches associées.
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
              {/* HEADER */}
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {stage.internship?.title ||
                      'Stage'}
                  </h2>

                  {stage.internship?.domain && (
                    <p className="mt-1 text-gray-500">
                      Domaine :{' '}
                      {stage.internship.domain}
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    stage.status,
                  )}`}
                >
                  {getStatusLabel(
                    stage.status,
                  )}
                </span>
              </div>

              {/* INFORMATIONS */}
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Entreprise
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {stage.company
                      ?.companyName ||
                      'Non définie'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Encadrant
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {stage.supervisor
                      ? `${stage.supervisor.firstName} ${stage.supervisor.lastName}`
                      : 'Non défini'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Date de début
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(
                      stage.startDate ??
                        undefined,
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Date de fin
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(
                      stage.endDate ??
                        undefined,
                    )}
                  </p>
                </div>
              </div>

              {/* PROGRESSION */}
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

              {/* STAGE EN ATTENTE */}
              {stage.status ===
                'EN_ATTENTE' && (
                <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-semibold text-yellow-800">
                    Stage en attente de démarrage
                  </p>

                  <p className="mt-1 text-sm text-yellow-700">
                    Votre candidature a été
                    sélectionnée. Le stage sera
                    démarré par votre encadrant
                    ou par l'entreprise.
                  </p>
                </div>
              )}

              {/* TÂCHES */}
              {stage.status ===
                'EN_COURS' && (
                <div className="mt-6 border-t pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tâches du stage
                    </h3>

                    <p className="text-sm text-gray-500">
                      Tâches données par votre
                      encadrant.
                    </p>
                  </div>

                  {taskLoading[
                    stage.id
                  ] ? (
                    <p className="text-sm text-gray-500">
                      Chargement des tâches...
                    </p>
                  ) : !tasks[
                      stage.id
                    ] ||
                    tasks[stage.id].length ===
                      0 ? (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Aucune tâche n'a encore
                        été ajoutée par votre
                        encadrant.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks[
                        stage.id
                      ].map((task) => (
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
                              className="rounded-lg border px-3 py-2 text-sm"
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
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STATUT */}
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

              {/* TERMINER */}
              {stage.status ===
                'EN_COURS' && (
                <div className="mt-6 border-t pt-5">
                  <button
                    onClick={() =>
                      handleFinishStage(
                        stage.id,
                      )
                    }
                    className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                  >
                    ✓ Terminer mon stage
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}