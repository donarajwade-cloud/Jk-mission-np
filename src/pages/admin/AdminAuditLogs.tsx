import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { AuditLog } from '../../types/index.ts';
import { formatNepaliDate } from '../../utils/format.ts';
import { ShieldCheck, Clock } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAuditLogs();
        if (res.success) setLogs(res.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Security & Traceability
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          System Audit Trails
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable records of financial distributions, product approvals, order completions, and administrative adjustments.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading audit events...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatNepaliDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 capitalize">{log.actorRole}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{log.actorUserId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-bold">{log.entityType}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{log.entityId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-snug">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
