import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type RegisterRole = 'STUDENT' | 'SUPERVISOR' | 'COMPANY' | 'ADMIN';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState<RegisterRole>('STUDENT');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [profession, setProfession] = useState('');
    const [department, setDepartment] = useState('');

    const [companyName, setCompanyName] = useState('');
    const [managerName, setManagerName] = useState('');
    const [managerTitle, setManagerTitle] = useState('');
    const [sector, setSector] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const [adminPin, setAdminPin] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
        const payload: Record<string, string> = {
        email,
        password,
        role,
        };

    if (role === 'STUDENT') {
        payload.firstName = firstName;
        payload.lastName = lastName;

        if (phone.trim()) {
            payload.phone = phone;
        }
    }

    if (role === 'SUPERVISOR') {
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.profession = profession;

        if (department.trim()) {
            payload.department = department;
        }
    }

    if (role === 'COMPANY') {
        payload.companyName = companyName;
        payload.managerName = managerName;

        if (managerTitle.trim()) {
        payload.managerTitle = managerTitle;
        }

        if (sector.trim()) {
        payload.sector = sector;
        }

        if (address.trim()) {
        payload.address = address;
        }

        if (phone.trim()) {
          payload.phone = phone;
        }
      }

      if (role === 'ADMIN') {
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.adminPin = adminPin;
      }

      await register(payload as any);

      navigate('/login', {
        replace: true,
        state: {
          message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.',
        },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Une erreur est survenue lors de l’inscription.';

      setError(
        Array.isArray(message)
          ? message.join(' ')
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell centered">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">InternFlow</p>

          <h1>Créer un compte</h1>

          <p>
            Créez votre compte selon votre rôle dans la gestion des stages.
          </p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Type de compte</label>

            <select
              id="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as RegisterRole)
              }
            >
              <option value="STUDENT">Étudiant</option>
              <option value="SUPERVISOR">Encadrant</option>
              <option value="COMPANY">Entreprise</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {(role === 'STUDENT' ||
            role === 'SUPERVISOR' ||
            role === 'ADMIN') && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom</label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                />
              </div>
            </>
          )}

          {role === 'SUPERVISOR' && (
            <>
              <div className="form-group">
                <label htmlFor="profession">Profession</label>

                <input
                  id="profession"
                  type="text"
                  value={profession}
                  onChange={(event) =>
                    setProfession(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  Département
                </label>

                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(event) =>
                    setDepartment(event.target.value)
                  }
                />
              </div>
            </>
          )}

          {role === 'STUDENT' && (
            <div className="form-group">
              <label htmlFor="phone">
                Téléphone <span>(optionnel)</span>
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />
            </div>
          )}

          {role === 'COMPANY' && (
            <>
              <div className="form-group">
                <label htmlFor="companyName">
                  Nom de l’entreprise
                </label>

                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="managerName">
                  Nom du responsable
                </label>

                <input
                  id="managerName"
                  type="text"
                  value={managerName}
                  onChange={(event) =>
                    setManagerName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="managerTitle">
                  Fonction du responsable
                </label>

                <input
                  id="managerTitle"
                  type="text"
                  value={managerTitle}
                  onChange={(event) =>
                    setManagerTitle(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="sector">Secteur</label>

                <input
                  id="sector"
                  type="text"
                  value={sector}
                  onChange={(event) =>
                    setSector(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse</label>

                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                />
              </div>
            </>
          )}

          {role === 'ADMIN' && (
            <div className="admin-registration-box">
              <div className="form-group">
                <label htmlFor="adminPin">
                  PIN administrateur
                </label>

                <input
                  id="adminPin"
                  type="password"
                  value={adminPin}
                  onChange={(event) =>
                    setAdminPin(event.target.value)
                  }
                  required
                  autoComplete="off"
                />
              </div>

              <p>
                La création d’un compte administrateur nécessite
                une autorisation supplémentaire.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? 'Création du compte…'
              : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}