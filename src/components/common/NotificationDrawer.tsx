import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatNepaliDate } from '../../utils/format.ts';
import { X, Bell, CheckCheck, Award, ShoppingBag, Layers, ShieldCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'cashback':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'commission':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadNotifications} unread</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadNotifications > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1 p-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No notifications yet</p>
              <p className="text-xs text-slate-500">We will notify you about cashback, sales, and orders here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-50 border-slate-100 text-slate-600'
                    : 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-200/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                      {formatNepaliDate(n.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
          JK Mission Nepal Notification System
        </div>
      </div>
    </div>
  );
};
