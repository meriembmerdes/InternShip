import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import AdminPageLayout from '../../components/AdminPageLayout';
import AdminSearchBar from '../../components/AdminSearchBar';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCompanies({
        search: search || undefined,
        sector: sector || undefined,
      });
      setCompanies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const toggleStatus = async (
    id: string,
    current: 'ACTIVE' | 'INACTIVE',
  ) => {
    try {
      await adminService.updateCompanyStatus(
        id,
        current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      );
      loadCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Voulez-vous vraiment supprimer cette entreprise ?')) {
      return;
    }

    try {
      await adminService.deleteUser(id);
      await loadCompanies();
    } catch (error) {
      console.error(error);
    }
  }

  return (
  <AdminPageLayout
    title="Gestion des entreprises"
    description="Consultez et gérez les entreprises partenaires."
    count={companies.length}
    countLabel="entreprises"
  >
    <AdminSearchBar
      search={search}
      setSearch={setSearch}
      onSearch={loadCompanies}
      placeholder="Rechercher une entreprise..."
    />

    {loading ? (
      <div className="admin-empty-state">
        Chargement des entreprises...
      </div>
    ) : companies.length === 0 ? (
      <div className="admin-empty-state">
        Aucune entreprise trouvée.
      </div>
    ) : (
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Secteur</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-avatar">
                      {company.companyName
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {company.companyName}
                      </strong>

                      <span>Entreprise</span>
                    </div>
                  </div>
                </td>

                <td>{company.user?.email}</td>

                <td>
                  {company.sector || '—'}
                </td>

                <td>
                  <span className="admin-status active">
                    <span className="status-dot" />
                    Actif
                  </span>
                </td>

                <td>
                  {new Date(
                    company.user?.createdAt
                  ).toLocaleDateString('fr-FR')}
                </td>

                <td>
                  <button
                    className="admin-delete-button"
                    onClick={() =>
                      handleDelete(company.id)
                    }
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </AdminPageLayout>
);
}