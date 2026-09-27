import { useEffect, useState } from 'react';
import {reportService,type Report,} from '../../services/reportService';

export default function SupervisorReportsPage() {
const [reports, setReports] = useState<Report[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [message, setMessage] = useState('');

const loadReports = async () => {
    try {
    setLoading(true);
    setError('');

    const data = await reportService.getAll();

    setReports(data);
    } catch (err) {
    console.error(err);
    setError(
        'Impossible de charger les rapports.',
    );
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    void loadReports();
}, []);

const updateStatus = async (
    id: string,
    status: 'VALIDE' | 'REFUSE',
) => {
    try {
    setError('');
    setMessage('');

    await reportService.updateStatus(
        id,
        status,
    );

    setMessage(
        status === 'VALIDE'
        ? 'Rapport accepté.'
        : 'Rapport refusé.',
    );

    await loadReports();
    } catch (err) {
    console.error(err);
    setError(
        'Impossible de modifier le rapport.',
    );
    }
};

const statusLabel = (
    status: Report['status'],
) => {
    switch (status) {
    case 'DEPOSE':
        return 'Déposé';

    case 'EN_REVISION':
        return 'En révision';

    case 'VALIDE':
        return 'Validé';

    case 'REFUSE':
        return 'Refusé';

    default:
        return status;
    }
};

if (loading) {
    return (
    <div className="p-6">
        Chargement des rapports...
    </div>
    );
}

return (
    <div className="p-6">
    <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
        Rapports des étudiants
        </h1>

        <p className="mt-2 text-gray-500">
        Consultez et validez les rapports des
        étudiants que vous encadrez.
        </p>
    </div>

    {message && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
        {message}
        </div>
    )}
    {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
        {error}
        </div>
    )}

    {reports.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
        Aucun rapport disponible.
        </div>
    ) : (
        <div className="space-y-4">
        {reports.map((report) => (
            <div
            key={report.id}
            className="rounded-xl border bg-white p-6 shadow-sm"
            >
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                <h2 className="text-xl font-semibold text-gray-800">
                    {report.stage?.internship?.title ??
                    'Stage'}
                </h2>

                <p className="mt-1 text-gray-500">
                    Étudiant :{' '}
                    {report.student?.firstName}{' '}
                    {report.student?.lastName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    Déposé le :{' '}
                    {report.submittedAt
                    ? new Date(
                        report.submittedAt,
                        ).toLocaleDateString('fr-FR')
                    : 'Non renseigné'}
                </p>
                </div>

                <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {statusLabel(report.status)}
                </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <a
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                📄 Voir PDF
                </a>

                {report.status !== 'VALIDE' && (
                <button
                    onClick={() =>
                    updateStatus(
                        report.id,
                        'VALIDE',
                    )
                    }
                    className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                >
                    ✓ Accepter
                </button>
                )}

                {report.status !== 'REFUSE' && (
                <button
                    onClick={() =>
                    updateStatus(
                        report.id,
                        'REFUSE',
                    )
                    }
                    className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                >
                    ✕ Refuser
                </button>
                )}
            </div>
            </div>
        ))}
        </div>
    )}
    </div>
);
}