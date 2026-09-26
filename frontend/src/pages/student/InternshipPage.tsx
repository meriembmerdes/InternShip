import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  internshipService,
  type Internship,
  type InternshipType,
} from '../../services/internshipService';

export default function InternshipsPage() {
  const navigate = useNavigate();

  const [internships, setInternships] =
    useState<Internship[]>([]);

  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [type, setType] =
    useState<InternshipType | ''>('');

  const [loading, setLoading] =
    useState(true);

  const loadInternships = async () => {
    try {
      setLoading(true);

      const result =
        await internshipService.getAll({
          search: search || undefined,
          domain: domain || undefined,
          type: type || undefined,
          page: 1,
          limit: 20,
        });

      setInternships(result.data);
    } catch (error) {
      console.error(
        'Erreur chargement offres:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const handleSearch = () => {
    loadInternships();
  };

  return (
    <div className="p-6">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Offres de stage
        </h1>

        <p className="mt-2 text-gray-500">
          Découvrez les offres de stage disponibles.
        </p>
      </div>

      {/* FILTRES */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">


        <select
          value={domain}
          onChange={(e) =>
            setDomain(e.target.value)
          }
          className="rounded-lg border px-4 py-3"
        >
          <option value="">
            Tous les domaines
          </option>

          <option value="CF">
            CF — Comptabilité et Finance
          </option>

          <option value="GTER">
            GTER — Génie thermique et énergie renouvelable
          </option>

          <option value="IT">
            IT — Technologie de l'informatique
          </option>

          <option value="M">
            M — Mécanique
          </option>
        </select>

        <select
          value={type}
          onChange={(e) =>
            setType(
              e.target.value as InternshipType | '',
            )
          }
          className="rounded-lg border px-4 py-3"
        >
          <option value="">
            Tous les types
          </option>

          <option value="OUVRIER">
            Stage ouvrier
          </option>

          <option value="TECHNICIEN">
            Stage technicien
          </option>

          <option value="FIN_ETUDE">
            Stage de fin d'étude
          </option>

          <option value="ETE">
            Stage d'été
          </option>
        </select>

        <button style={{ marginLeft: '10px', backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', borderRadius: '10px' }}
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          Rechercher
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <p className="text-gray-500">
          Chargement des offres...
        </p>
      )}

      {/* EMPTY */}

      {!loading &&
        internships.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              Aucune offre disponible
            </h2>

            <p className="mt-2 text-gray-500">
              Aucune offre ne correspond à votre recherche.
            </p>
          </div>
        )}

      {/* OFFRES */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {internships.map((internship) => (
          <div
            key={internship.id}
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >

            <div className="mb-4 flex gap-2 flex-wrap">

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {internship.domain}
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {internship.type === 'OUVRIER'
                  ? 'Stage ouvrier'
                  : internship.type === 'TECHNICIEN'
                    ? 'Stage technicien'
                    : internship.type === 'FIN_ETUDE'
                      ? "Stage de fin d'étude"
                      : "Stage d'été"}
              </span>

            </div>

            <h2 className="text-xl font-bold">
              {internship.title}
            </h2>

            <p className="mt-3 line-clamp-3 text-gray-600">
              {internship.description}
            </p>

            <div className="mt-5 space-y-2 text-sm text-gray-600">

              {internship.location && (
                <p>
                  📍 {internship.location}
                </p>
              )}

              {internship.duration && (
                <p>
                  ⏱️ {internship.duration}
                </p>
              )}

              <p>
                👥 {internship.numberOfPlaces} place(s)
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  `/student/internships/${internship.id}`,
                )
              }
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
            >
              Voir l'offre
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}