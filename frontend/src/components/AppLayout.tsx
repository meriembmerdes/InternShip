import { Outlet } from 'react-router-dom';
import RoleNavigation from './RoleNavigation';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <RoleNavigation />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}