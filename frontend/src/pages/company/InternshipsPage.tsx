import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  internshipService,
  type Internship,
  type InternshipFormData,
  type Supervisor,
} from '../../services/internshipService';

const initialForm: InternshipFormData = {
  title: '',
  description: '',
  domain: '',
  type: 'TECHNICIEN',
  duration: '',
  location: '',
  startDate: '',
  endDate: '',
  numberOfPlaces: 1,
  status: 'PUBLIEE',
  supervisorId: '',
};

export default function CompanyInternshipsPage() {
  const [internships, setInternships] =
    useState<Internship[]>([]);

  const [supervisors, setSupervisors] =
    useState<Supervisor[]>([]);

  const [form, setForm] =
    useState<InternshipFormData>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);

      const [internshipsResult, supervisorsResult] =
        await Promise.all([
          internshipService.getAll({
            page: 1,
            limit: 50,
          }),
          internshipService.getAvailableSupervisors(),
        ]);

      setInternships(internshipsResult.data);
      setSupervisors(supervisorsResult);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Impossible de charger les données.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleChange = (
    field: keyof InternshipFormData,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await internshipService.create({
        ...form,
        numberOfPlaces: Number(
          form.numberOfPlaces,
        ),
        supervisorId:
          form.supervisorId || undefined,
      });

      setMessage(
        'Offre de stage créée avec succès.',
      );

      setForm(initialForm);

      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Impossible de créer l’offre.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">

      <header className="topbar">
        <div>
          <p className="eyebrow">
            Gestion des offres
          </p>

          <h1>
            Créer une offre de stage
          </h1>

          <p>
            Publiez une offre et choisissez un
            encadrant.
          </p>
        </div>
      </header>

      {message && (
        <div className="message success">
          {message}
        </div>
      )}

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="profile-form"
      >

        <div className="form-section">

          <h2>
            Informations de l'offre
          </h2>

          <div className="form-group">
            <label>Titre</label>

            <input
              value={form.title}
              onChange={(e) =>
                handleChange(
                  'title',
                  e.target.value,
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                handleChange(
                  'description',
                  e.target.value,
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Domaine</label>

            <input
              value={form.domain}
              onChange={(e) =>
                handleChange(
                  'domain',
                  e.target.value,
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Type de stage</label>

            <select
              value={form.type}
              onChange={(e) =>
                handleChange(
                  'type',
                  e.target.value,
                )
              }
            >
              <option value="OUVRIER">
                Stage ouvrier
              </option>

              <option value="TECHNICIEN">
                Stage technicien
              </option>

              <option value="FIN_ETUDE">
                Projet de fin d'études
              </option>

              <option value="ETE">
                Stage d'été
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Durée</label>

            <input
              value={form.duration}
              onChange={(e) =>
                handleChange(
                  'duration',
                  e.target.value,
                )
              }
              placeholder="Ex : 3 mois"
            />
          </div>

          <div className="form-group">
            <label>Lieu</label>

            <input
              value={form.location}
              onChange={(e) =>
                handleChange(
                  'location',
                  e.target.value,
                )
              }
              placeholder="Ex : Tunis"
            />
          </div>

          <div className="form-group">
            <label>
              Nombre de places
            </label>

            <input
              type="number"
              min="1"
              value={form.numberOfPlaces}
              onChange={(e) =>
                handleChange(
                  'numberOfPlaces',
                  Number(e.target.value),
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Date de début
            </label>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                handleChange(
                  'startDate',
                  e.target.value,
                )
              }
            />
          </div>

          <div className="form-group">
            <label>
              Date de fin
            </label>

            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                handleChange(
                  'endDate',
                  e.target.value,
                )
              }
            />
          </div>

          <div className="form-group">
            <label>
              Encadrant
            </label>

            <select
              value={form.supervisorId}
              onChange={(e) =>
                handleChange(
                  'supervisorId',
                  e.target.value,
                )
              }
            >
              <option value="">
                -- Choisir un encadrant --
              </option>

              {supervisors.map(
                (supervisor) => (
                  <option
                    key={supervisor.id}
                    value={supervisor.id}
                  >
                    {supervisor.firstName}{' '}
                    {supervisor.lastName}
                    {supervisor.profession
                      ? ` - ${supervisor.profession}`
                      : ''}
                  </option>
                ),
              )}
            </select>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? 'Création...'
              : 'Créer l’offre'}
          </button>

        </div>
      </form>

      <div className="form-section">

        <h2>
          Mes offres de stage
        </h2>

        {loading ? (
          <p>Chargement...</p>
        ) : internships.length === 0 ? (
          <p>
            Aucune offre créée.
          </p>
        ) : (
          <div className="internship-list">

            {internships.map(
              (internship) => (
                <div
                  key={internship.id}
                  className="profile-readonly"
                >

                  <div>
                    <span>Titre</span>
                    <strong>
                      {internship.title}
                    </strong>
                  </div>

                  <div>
                    <span>Domaine</span>
                    <strong>
                      {internship.domain}
                    </strong>
                  </div>

                  <div>
                    <span>Encadrant</span>
                    <strong>
                      {internship.supervisor
                        ? `${internship.supervisor.firstName} ${internship.supervisor.lastName}`
                        : 'Non attribué'}
                    </strong>
                  </div>

                  <div>
                    <span>Places</span>
                    <strong>
                      {internship.numberOfPlaces}
                    </strong>
                  </div>

                  <div>
                    <span>Statut</span>
                    <strong>
                      {internship.status}
                    </strong>
                  </div>

                </div>
              ),
            )}

          </div>
        )}

      </div>

    </div>
  );
}