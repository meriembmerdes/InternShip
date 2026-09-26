import { type FormEvent, useEffect, useState } from 'react';
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

        if (data.role === 'ADMIN') {
          setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          }); 
        }

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
  if (profile.role === 'ADMIN') {
    await profileService.updateAdmin(form);
  }

  if (profile.role === 'STUDENT') {
    await profileService.updateStudent(form);
  }

  if (profile.role === 'SUPERVISOR') {
    await profileService.updateSupervisor(form);
  }

  if (profile.role === 'COMPANY') {
    await profileService.updateCompany(form);
  }

  const updated = await profileService.getMyProfile();

  setProfile(updated);

  if (updated.role === 'ADMIN') {
    setForm({
      firstName: updated.firstName ?? '',
      lastName: updated.lastName ?? '',
    });
  }

  setMessage('Profil mis à jour avec succès.');
} catch (err: any) {
  setError(
    err?.response?.data?.message ||
      'Impossible de mettre à jour le profil.',
  );
} finally {
  setIsSaving(false);
}
}

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
  <div className="profile-page">
    <RoleNavigation />

    <main className="profile-content">
      <div className="profile-header">
        <div>
          <p className="profile-eyebrow">MON PROFIL</p>
          <h1>Mon profil</h1>
          <p className="profile-subtitle">
            Gérez vos informations personnelles et professionnelles.
          </p>
        </div>

        <div className="profile-role-badge">
          {profile.role === 'STUDENT'
            ? 'Étudiant'
            : profile.role === 'SUPERVISOR'
            ? 'Encadrant'
            : profile.role === 'COMPANY'
            ? 'Entreprise'
            : 'Administrateur'}
        </div>
      </div>

      {message && (
        <div className="profile-alert profile-alert-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="profile-alert profile-alert-error">
          ! {error}
        </div>
      )}

      <div className="profile-layout">

        <aside className="profile-card">
          <div className="profile-avatar">
            {(
              profile.firstName ||
              profile.student?.firstName ||
              profile.supervisor?.firstName ||
              profile.company?.companyName ||
              'U'
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <h2>
            {profile.role === 'STUDENT'
              ? `${profile.student?.firstName ?? ''} ${profile.student?.lastName ?? ''}`
              : profile.role === 'SUPERVISOR'
              ? `${profile.supervisor?.firstName ?? ''} ${profile.supervisor?.lastName ?? ''}`
              : profile.role === 'COMPANY'
              ? profile.company?.companyName
              : `${profile.firstName ?? ''} ${profile.lastName ?? ''}`}
          </h2>

          <span className="profile-card-role">
            {profile.role === 'STUDENT'
              ? 'Étudiant'
              : profile.role === 'SUPERVISOR'
              ? 'Encadrant'
              : profile.role === 'COMPANY'
              ? 'Entreprise'
              : 'Administrateur'}
          </span>

          <div className="profile-card-info">
            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>

            <div>
              <span>Statut</span>
              <strong
                className={
                  profile.isActive === 'ACTIVE'
                    ? 'profile-status active'
                    : 'profile-status inactive'
                }
              >
                <i />
                {profile.isActive === 'ACTIVE'
                  ? 'Actif'
                  : 'Inactif'}
              </strong>
            </div>
          </div>
        </aside>

        <form
          className="profile-form-modern"
          onSubmit={handleSubmit}
        >
          <div className="profile-section">
            <div className="profile-section-header">
              <div>
                <h2>Informations du compte</h2>
                <p>Informations générales de votre compte.</p>
              </div>
            </div>

            <div className="profile-account-grid">
              <div className="profile-info-box">
                <span>Adresse email</span>
                <strong>{profile.email}</strong>
              </div>

              <div className="profile-info-box">
                <span>Rôle</span>
                <strong>
                  {profile.role === 'STUDENT'
                    ? 'Étudiant'
                    : profile.role === 'SUPERVISOR'
                    ? 'Encadrant'
                    : profile.role === 'COMPANY'
                    ? 'Entreprise'
                    : 'Administrateur'}
                </strong>
              </div>
            </div>
          </div>

          {profile.role === 'ADMIN' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <div>
                  <h2>Informations personnelles</h2>
                  <p>Modifiez vos informations administrateur.</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                {renderField('Prénom', 'firstName')}
                {renderField('Nom', 'lastName')}
              </div>
            </div>
          )}

          {profile.role === 'STUDENT' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <div>
                  <h2>Informations étudiant</h2>
                  <p>Vos informations personnelles et académiques.</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                {renderField('Prénom', 'firstName')}
                {renderField('Nom', 'lastName')}
                {renderField('Téléphone', 'phone', 'tel')}
                {renderField('Institution', 'institution')}
                {renderField('Spécialité', 'specialty')}
                {renderField('Niveau', 'level')}
              </div>

              <div className="profile-full-field">
                {renderField('Biographie', 'bio')}
              </div>
            </div>
          )}

          {profile.role === 'SUPERVISOR' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <div>
                  <h2>Informations encadrant</h2>
                  <p>Vos informations professionnelles.</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                {renderField('Prénom', 'firstName')}
                {renderField('Nom', 'lastName')}
                {renderField('Profession', 'profession')}
                {renderField('Département', 'department')}
              </div>
            </div>
          )}

          {profile.role === 'COMPANY' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <div>
                  <h2>Informations entreprise</h2>
                  <p>Les informations de votre entreprise.</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                {renderField('Nom de l’entreprise', 'companyName')}
                {renderField('Nom du responsable', 'managerName')}
                {renderField('Fonction du responsable', 'managerTitle')}
                {renderField('Secteur', 'sector')}
                {renderField('Téléphone', 'phone', 'tel')}
              </div>

              <div className="profile-full-field">
                {renderField('Adresse', 'address')}
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button
              className="profile-save-button"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? 'Enregistrement…'
                : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
);
}