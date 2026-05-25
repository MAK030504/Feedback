import { useState } from "react";
import toast from "react-hot-toast";
import { addTicketMessage, trackTicket } from "../services/publicApi";
import { StatusBadge } from "../components/StatusBadge";
import { formatEnum } from "../utils/constants";

export const TrackTicketPage = () => {
  const [ticketId, setTicketId] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  const handleLookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await trackTicket(ticketId.trim(), token.trim());
      setTicket(data);
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Unable to find ticket");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (event) => {
    event.preventDefault();
    if (!ticket) return;

    try {
      const created = await addTicketMessage(ticket.ticketId, token.trim(), message.trim());
      setTicket((previous) => ({ ...previous, messages: [...previous.messages, created] }));
      setMessage("");
      toast.success("Message sent anonymously");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to send message");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Track Ticket</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleLookup}>
          <input
            value={ticketId}
            onChange={(event) => setTicketId(event.target.value)}
            placeholder="Ticket ID (MLSA-2026-0012)"
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            required
          />
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Secret access token"
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
          >
            {loading ? "Checking..." : "Track"}
          </button>
        </form>
      </section>

      {ticket ? (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-semibold">{ticket.title}</h3>
              <StatusBadge value={ticket.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">{formatEnum(ticket.category)}</p>
            <p className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{ticket.description}</p>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
              <h4 className="font-semibold">Conversation</h4>
              <div className="mt-3 space-y-3">
                {ticket.messages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <p className="font-medium text-slate-700 dark:text-slate-200">{item.sender}</p>
                    <p className="mt-1 whitespace-pre-wrap">{item.message}</p>
                  </div>
                ))}
              </div>

              <form className="mt-4 space-y-2" onSubmit={handleMessage}>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  minLength={2}
                  maxLength={4000}
                  placeholder="Continue the anonymous conversation"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  required
                />
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                  Send Message
                </button>
              </form>
            </div>
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-lg font-semibold">Ticket Details</h4>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Ticket</dt>
                <dd className="font-medium">{ticket.ticketId}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Alias</dt>
                <dd className="font-medium">{ticket.anonymousAlias}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium">{formatEnum(ticket.priority)}</dd>
              </div>
            </dl>
          </aside>
        </section>
      ) : null}
    </div>
  );
};
