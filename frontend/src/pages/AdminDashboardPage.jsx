import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  fetchAdminFeedback,
  fetchAdminFeedbackDetail,
  fetchAnalytics,
  exportCsv,
  replyAdminFeedback,
  updateAdminFeedback,
} from "../services/adminApi";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  formatEnum,
} from "../utils/constants";
import { StatusBadge } from "../components/StatusBadge";
import { StatCard } from "../components/StatCard";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

const initialFilters = {
  type: "",
  status: "",
  category: "",
  search: "",
};

export const AdminDashboardPage = () => {
  const { signOut } = useAdminAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [feedbackList, setFeedbackList] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [updatePayload, setUpdatePayload] = useState({
    status: "pending",
    priority: "medium",
    isPublic: false,
  });

  const loadList = useCallback(async () => {
    try {
      const data = await fetchAdminFeedback({
        ...filters,
        page,
        pageSize: 10,
      });
      setFeedbackList(data);
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to load feedback list");
    }
  }, [filters, page]);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to load analytics");
    }
  }, []);

  const loadDetail = useCallback(async (id) => {
    try {
      const data = await fetchAdminFeedbackDetail(id);
      setSelectedId(id);
      setSelectedDetail(data);
      setInternalNotes(data.internalNotes ?? "");
      setUpdatePayload({
        status: data.status,
        priority: data.priority,
        isPublic: data.isPublic,
      });
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to load ticket detail");
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadAnalytics();

    const socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.emit("admin:subscribe");
    socket.on("feedback:new", () => {
      loadList();
      loadAnalytics();
    });
    socket.on("feedback:updated", () => {
      loadList();
      loadAnalytics();
    });
    socket.on("feedback:message", () => {
      loadList();
      if (selectedId) {
        loadDetail(selectedId);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [loadAnalytics, loadDetail, loadList, selectedId]);

  const statusMap = useMemo(() => {
    if (!analytics) return {};
    return analytics.statusCounts.reduce((accumulator, item) => {
      accumulator[item.status] = item._count.id;
      return accumulator;
    }, {});
  }, [analytics]);

  const monthlyData = analytics?.monthlyCounts ?? [];
  const categoryData =
    analytics?.categoryCounts.map((item) => ({
      name: formatEnum(item.category),
      count: item._count.id,
    })) ?? [];

  const totalSubmissions = Object.values(statusMap).reduce((sum, value) => sum + value, 0);

  const handleExport = async () => {
    try {
      const blob = await exportCsv();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mlsa-feedback-report.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message ?? "CSV export failed");
    }
  };

  const handleUpdateTicket = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    try {
      await updateAdminFeedback(selectedId, {
        ...updatePayload,
        internalNotes,
      });
      toast.success("Ticket updated");
      await loadList();
      await loadDetail(selectedId);
      await loadAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Ticket update failed");
    }
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedId || !replyDraft.trim()) return;

    try {
      await replyAdminFeedback(selectedId, replyDraft.trim());
      setReplyDraft("");
      await loadDetail(selectedId);
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Reply failed");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-sm text-slate-500">Monitor anonymous MLSA feedback and resolve issues securely.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-rose-400 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            Logout
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <StatCard label="Total Submissions" value={totalSubmissions} />
        <StatCard label="Pending" value={statusMap.pending ?? 0} />
        <StatCard label="Under Review" value={statusMap.under_review ?? 0} />
        <StatCard label="Resolved" value={statusMap.resolved ?? 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Monthly trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Category breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={65} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 grid gap-2 md:grid-cols-4">
            <select
              value={filters.type}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, type: event.target.value }));
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All types</option>
              {FEEDBACK_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, status: event.target.value }));
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All statuses</option>
              {FEEDBACK_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, category: event.target.value }));
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All categories</option>
              {FEEDBACK_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <input
              value={filters.search}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, search: event.target.value }));
              }}
              placeholder="Search..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Ticket</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList?.items?.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => loadDetail(item.id)}
                    className="cursor-pointer border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-2 py-2 font-medium">{item.ticketId}</td>
                    <td className="px-2 py-2">{formatEnum(item.type)}</td>
                    <td className="px-2 py-2">{formatEnum(item.category)}</td>
                    <td className="px-2 py-2">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="px-2 py-2">
                      <StatusBadge value={item.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page {feedbackList?.page ?? 1} of {feedbackList?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (feedbackList?.totalPages ?? 1)}
                className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {!selectedDetail ? (
            <p className="text-sm text-slate-500">Select a ticket to view details.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedDetail.ticketId}</h3>
                <p className="text-sm text-slate-500">{selectedDetail.anonymousAlias}</p>
              </div>

              <p className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">{selectedDetail.description}</p>

              <form className="space-y-2" onSubmit={handleUpdateTicket}>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={updatePayload.status}
                    onChange={(event) =>
                      setUpdatePayload((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {FEEDBACK_STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={updatePayload.priority}
                    onChange={(event) =>
                      setUpdatePayload((prev) => ({
                        ...prev,
                        priority: event.target.value,
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {FEEDBACK_PRIORITIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={updatePayload.isPublic}
                    onChange={(event) =>
                      setUpdatePayload((prev) => ({
                        ...prev,
                        isPublic: event.target.checked,
                      }))
                    }
                  />
                  Show on public suggestions board
                </label>

                <textarea
                  value={internalNotes}
                  onChange={(event) => setInternalNotes(event.target.value)}
                  rows={3}
                  placeholder="Internal notes (admin-only)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />

                <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                  Save Updates
                </button>
              </form>

              <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                <h4 className="font-medium">Conversation</h4>
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {selectedDetail.messages.map((message) => (
                    <div key={message.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                      <p className="font-medium">{message.sender}</p>
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                </div>
                <form className="space-y-2" onSubmit={handleReply}>
                  <textarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Reply anonymously as admin"
                  />
                  <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                    Send Reply
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
