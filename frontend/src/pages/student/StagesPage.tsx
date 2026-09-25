import { useEffect, useState } from 'react';
import { stageService, type Stage } from '../../services/stageService';

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
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Mes stages</h1>

      {stages.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          Aucun stage pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                {stage.internship?.title || 'Stage'}
              </h2>

              <p className="mt-2 text-gray-600">
                {stage.internship?.domain}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <span className="text-sm text-gray-500">Statut</span>
                  <p className="font-medium">{stage.status}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Progression</span>
                  <p className="font-medium">{stage.progression}%</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Entreprise</span>
                  <p className="font-medium">
                    {stage.company?.companyName || 'Non définie'}
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