import { useEffect, useState } from 'react';
import { notificationService, type Notification } from '../services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getMine();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((notification) => !notification.isRead) && (
          <button
            onClick={markAllAsRead}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          Aucune notification.
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
              className={`cursor-pointer rounded-xl border bg-white p-5 shadow-sm ${
                !notification.isRead ? 'border-blue-300' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{notification.title}</h2>
                  <p className="mt-1 text-gray-600">{notification.message}</p>
                  <p className="mt-2 text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {!notification.isRead && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    Nouveau
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}