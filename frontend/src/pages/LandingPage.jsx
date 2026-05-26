import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export const LandingPage = () => {
  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          MLSA Anonymous Feedback Portal
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Internal and private platform for Microsoft Learn Student Ambassador (MLSA) GIKI chapter.
          Submit complaints, suggestions, and event feedback anonymously without sharing identity.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link
            to="/submit"
            className="rounded-xl bg-sky-500 px-4 py-3 text-center font-medium text-white hover:bg-sky-400"
          >
            Submit Anonymous Feedback
          </Link>
          <Link
            to="/track"
            className="rounded-xl border border-green-300 px-4 py-3 text-center font-medium text-green-800 hover:bg-green-50 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-900/30"
          >
            Track Existing Ticket
          </Link>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>• No name, email, roll number, or login required.</li>
          <li>• Each submission receives a ticket ID and private secret token.</li>
          <li>• Admin panel is restricted to MLSA leadership only.</li>
        </ul>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick access QR</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Share this QR code during MLSA events for instant feedback collection.
        </p>
        <div className="mt-4 flex justify-center rounded-xl bg-sky-100 p-4 dark:bg-sky-900/40">
          <QRCodeSVG value={window.location.origin + "/submit"} size={180} />
        </div>
      </aside>
    </div>
  );
};
