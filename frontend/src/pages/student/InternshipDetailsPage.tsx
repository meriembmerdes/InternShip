import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { internshipService } from '../../services/internshipService';
import type { Internship } from '../../services/internshipService';
import { applicationService } from '../../services/applicationService';

export default function InternshipDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await internshipService.getById(id);
        setInternship(data);
      } catch (error) {
        console.error('Erreur chargement offre:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleApply = async () => {
    if (!internship) return;

    setApplying(true);
    setMessage('');

    try {
      await applicationService.create({
        internshipId: internship.id,
        motivationMessage: motivationMessage || undefined,
      });

      setMessage('Votre candidature a été envoyée avec succès.');
      setMotivationMessage('');
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || 'Erreur lors de la candidature.'
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!internship) {
    return (
      <div className="p-6">
        <p>Offre introuvable.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/student/internships')}
        className="mb-6 text-blue-600"
      >
        ← Retour aux offres
      </button>

      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8 shadow-sm">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
          {internship.domain}
        </span>

        <h1 className="mt-5 text-3xl font-bold">
          {internship.title}
        </h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Domaine</p>
            <p className="font-medium">{internship.domain}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Durée</p>
            <p className="font-medium">
              {internship.duration || 'Non précisée'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Places</p>
            <p className="font-medium">{internship.numberOfPlaces}</p>
          </div>
        </div>

        {internship.location && (
          <div className="mt-6">
            <p className="text-sm text-gray-500">Localisation</p>
            <p className="font-medium">📍 {internship.location}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
            {internship.description}
          </p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold">
            Candidature
          </h2>

          <textarea
            value={motivationMessage}
            onChange={(e) => setMotivationMessage(e.target.value)}
            placeholder="Écrivez votre message de motivation..."
            className="mt-4 w-full rounded-lg border p-3"
            rows={5}
          />

          {message && (
            <p className="mt-3 text-sm text-blue-600">
              {message}
            </p>
          )}

          <button
            onClick={handleApply}
            disabled={applying}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {applying ? 'Envoi...' : 'Postuler à cette offre'}
          </button>

          <button
            onClick={() => navigate('/student/applications')}
            className="ml-3 rounded-lg border px-6 py-3 font-medium"
          >
            Mes candidatures
          </button>
        </div>
      </div>
    </div>
  );
}