import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  commentOnSuggestion,
  fetchPublicSuggestions,
  upvoteSuggestion,
} from "../services/publicApi";

export const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});

  const loadSuggestions = async () => {
    try {
      const data = await fetchPublicSuggestions();
      setSuggestions(data);
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to load suggestions");
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleUpvote = async (id) => {
    try {
      const result = await upvoteSuggestion(id);
      setSuggestions((prev) => prev.map((item) => (item.id === id ? { ...item, votes: result.votes } : item)));
      toast.success("Upvoted");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Unable to upvote");
    }
  };

  const handleComment = async (event, id) => {
    event.preventDefault();
    const message = commentDrafts[id]?.trim();
    if (!message) return;

    try {
      const comment = await commentOnSuggestion(id, message);
      setSuggestions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, messages: [comment, ...item.messages.slice(0, 4)] } : item,
        ),
      );
      setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
      toast.success("Comment posted");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Comment failed");
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Public MLSA Suggestions Board</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Suggestions marked public by submitters can be upvoted and discussed anonymously.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm dark:border-slate-800 dark:bg-slate-900">
          No public suggestions yet.
        </div>
      ) : null}

      {suggestions.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.anonymousAlias}</p>
            </div>
            <button
              type="button"
              onClick={() => handleUpvote(item.id)}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Upvote ({item.votes})
            </button>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{item.description}</p>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Anonymous comments</p>
            {item.messages.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              item.messages.map((message) => (
                <div key={message.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  {message.message}
                </div>
              ))
            )}

            <form className="mt-3 flex gap-2" onSubmit={(event) => handleComment(event, item.id)}>
              <input
                value={commentDrafts[item.id] ?? ""}
                onChange={(event) =>
                  setCommentDrafts((prev) => ({
                    ...prev,
                    [item.id]: event.target.value,
                  }))
                }
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                placeholder="Add anonymous comment"
              />
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                Post
              </button>
            </form>
          </div>
        </article>
      ))}
    </section>
  );
};
