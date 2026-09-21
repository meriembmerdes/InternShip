import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  profileService,
  type MyProfile,
} from '../services/profile.service';
import RoleNavigation from '../components/RoleNavigation';

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);

        const data = await profileService.getMyProfile();

        setProfile(data);

        if (data.student) {
          setForm({
            firstName: data.student.firstName ?? '',
            lastName: data.student.lastName ?? '',
            phone: data.student.phone ?? '',
            institution: data.student.institution ?? '',
            specialty: data.student.specialty ?? '',
            level: data.student.level ?? '',
            bio: data.student.bio ?? '',
          });
        }

        if (data.supervisor) {
          setForm({
            firstName: data.supervisor.firstName ?? '',
            lastName: data.supervisor.lastName ?? '',
            profession: data.supervisor.profession ?? '',
            department: data.supervisor.department ?? '',
          });
        }

        if (data.company) {
          setForm({
            managerName: data.company.managerName ?? '',
            companyName: data.company.companyName ?? '',
            sector: data.company.sector ?? '',
            address: data.company.address ?? '',
            phone: data.company.phone ?? '',
            managerTitle: data.company.managerTitle ?? '',
          });
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Impossible de charger votre profil.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleChange = (
    field: string,
    value: string,
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

    if (!profile) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      if (profile.role === 'STUDENT') {
        await profileService.updateStudent(form);
      }

      if (profile.role === 'SUPERVISOR') {
        await profileService.updateSupervisor(form);
      }

      if (profile.role === 'COMPANY') {
        await profileService.updateCompany(form);
      }

      setMessage('Profil mis à jour avec succès.');

      const updated = await profileService.getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Impossible de mettre à jour le profil.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-shell centered">
        Chargement du profil…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <RoleNavigation />
        <div className="message error">
          {error || 'Profil introuvable.'}
        </div>
      </div>
    );
  }

  const renderField = (
    label: string,
    field: string,
    type = 'text',
  ) => (
    <div className="form-group" key={field}>
      <label htmlFor={field}>{label}</label>

      {field === 'bio' || field === 'address' ? (
        <textarea
          id={field}
          value={form[field] ?? ''}
          onChange={(event) =>
            handleChange(field, event.target.value)
          }
          rows={4}
        />
      ) : (
        <input
          id={field}
          type={type}
          value={form[field] ?? ''}
          onChange={(event) =>
            handleChange(field, event.target.value)
          }
        />
      )}
    </div>
  );

  return (
    <div className="page-shell">
      <RoleNavigation />

      <header className="topbar">
        <div>
          <p className="eyebrow">Mon profil</p>
          <h1>Gérer mon profil</h1>
          <p>{profile.email}</p>
        </div>
      </header>

      {message ? (
        <div className="message success">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="message error">
          {error}
        </div>
      ) : null}

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >
        <div className="form-section">
          <h2>Informations du compte</h2>

          <div className="profile-readonly">
            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>

            <div>
              <span>Rôle</span>
              <strong>{profile.role}</strong>
            </div>
          </div>
        </div>

        {profile.role === 'STUDENT' ? (
          <div className="form-section">
            <h2>Informations étudiant</h2>

            {renderField('Prénom', 'firstName')}
            {renderField('Nom', 'lastName')}
            {renderField('Téléphone', 'phone', 'tel')}
            {renderField('Institution', 'institution')}
            {renderField('Spécialité', 'specialty')}
            {renderField('Niveau', 'level')}
            {renderField('Biographie', 'bio')}
          </div>
        ) : null}

        {profile.role === 'SUPERVISOR' ? (
          <div className="form-section">
            <h2>Informations encadrant</h2>

            {renderField('Prénom', 'firstName')}
            {renderField('Nom', 'lastName')}
            {renderField('Profession', 'profession')}
            {renderField('Département', 'department')}
          </div>
        ) : null}

        {profile.role === 'COMPANY' ? (
          <div className="form-section">
            <h2>Informations entreprise</h2>

            {renderField('Nom de l’entreprise', 'companyName')}
            {renderField('Nom du responsable', 'managerName')}
            {renderField('Fonction du responsable', 'managerTitle')}
            {renderField('Secteur', 'sector')}
            {renderField('Adresse', 'address')}
            {renderField('Téléphone', 'phone', 'tel')}
          </div>
        ) : null}

        {profile.role !== 'ADMIN' ? (
          <button
            className="primary-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? 'Enregistrement…'
              : 'Enregistrer les modifications'}
          </button>
        ) : (
          <div className="message">
            Le profil administrateur est géré par
            l’administration.
          </div>
        )}
      </form>
    </div>
  );
}