import { useState } from "react";
import toast from "react-hot-toast";
import { submitFeedback } from "../services/publicApi";
import { FEEDBACK_CATEGORIES, FEEDBACK_TYPES } from "../utils/constants";

const initialForm = {
  type: "complaint",
  category: "event_management",
  title: "",
  description: "",
  isPublic: false,
  attachment: null,
};

export const SubmitFeedbackPage = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const onChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === "file") {
      setForm((prev) => ({ ...prev, attachment: files?.[0] ?? null }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const data = await submitFeedback(form);
      setReceipt(data);
      setForm(initialForm);
      toast.success("Anonymous feedback submitted.");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Submit Anonymous Feedback</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your identity is not requested or stored. Share accurate details to help MLSA improve.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Type</span>
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                required
              >
                {FEEDBACK_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Category</span>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                required
              >
                {FEEDBACK_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span>Title</span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              minLength={5}
              maxLength={120}
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={7}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              minLength={20}
              maxLength={5000}
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Optional Attachment (JPG, PNG, WEBP, PDF; max 5MB)</span>
            <input
              type="file"
              name="attachment"
              onChange={onChange}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={onChange}
              disabled={form.type !== "suggestion"}
            />
            Allow this suggestion to be shown on public MLSA suggestions board.
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {submitting ? "Submitting..." : "Submit Anonymously"}
          </button>
        </form>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">After submission</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          You will receive a ticket ID and secret token. Save both to track updates and continue anonymous
          conversation.
        </p>

        {receipt ? (
          <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
            <p>
              <strong>Ticket ID:</strong> {receipt.ticketId}
            </p>
            <p className="mt-1 break-all">
              <strong>Secret Token:</strong> {receipt.secretToken}
            </p>
            <p className="mt-1">
              <strong>Alias:</strong> {receipt.anonymousAlias}
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
};
