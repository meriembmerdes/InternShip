import type { ReactNode } from 'react';

type AdminPageLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  children: ReactNode;
};

export default function AdminPageLayout({
  eyebrow = 'ADMINISTRATION',
  title,
  description,
  count,
  countLabel = 'éléments',
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>

          <h1>{title}</h1>

          {description && (
            <p>{description}</p>
          )}
        </div>

        {count !== undefined && (
          <div className="users-count-card">
            <strong>{count}</strong>
            <span>{countLabel}</span>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}