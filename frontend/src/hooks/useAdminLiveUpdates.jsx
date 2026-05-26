import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { formatEnum } from "../utils/constants";
import { showAdminBrowserNotification } from "../utils/adminNotifications";

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

const typeLabel = (type) => formatEnum(type);

const notifyNewSubmission = (payload, onOpenTicket) => {
  const label = typeLabel(payload.type);
  const title = payload.title?.trim() || "Untitled submission";
  const message = `New ${label}: ${title} (${payload.ticketId})`;

  toast.success(
    (toastItem) => (
      <div className="space-y-2">
        <p className="text-sm">{message}</p>
        {onOpenTicket ? (
          <button
            type="button"
            className="rounded-md bg-sky-500 px-2 py-1 text-xs font-medium text-white hover:bg-sky-400"
            onClick={() => {
              toast.dismiss(toastItem.id);
              onOpenTicket(payload);
            }}
          >
            View ticket
          </button>
        ) : null}
      </div>
    ),
    {
      duration: 8000,
      id: `feedback-new-${payload.id}`,
    },
  );

  showAdminBrowserNotification({
    title: `New ${label}`,
    body: `${title} · ${payload.ticketId}`,
    tag: `feedback-new-${payload.id}`,
    onClick: () => onOpenTicket?.(payload),
  });
};

export const useAdminLiveUpdates = ({
  token,
  selectedId,
  onRefreshList,
  onRefreshAnalytics,
  onRefreshDetail,
  onOpenTicket,
}) => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLive(false);
      return undefined;
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    const refreshList = () => onRefreshList?.();
    const refreshAnalytics = () => onRefreshAnalytics?.();
    const refreshDetail = () => {
      if (selectedId) {
        onRefreshDetail?.(selectedId);
      }
    };

    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));
    socket.emit("admin:subscribe", { token });

    socket.on("admin:error", () => {
      toast.error("Live updates unauthorized. Please log in again.");
    });

    socket.on("feedback:new", (payload) => {
      refreshList();
      refreshAnalytics();

      if (payload?.type === "complaint" || payload?.type === "suggestion") {
        notifyNewSubmission(payload, onOpenTicket);
      }
    });

    socket.on("feedback:updated", () => {
      refreshList();
      refreshAnalytics();
    });

    socket.on("feedback:message", (payload) => {
      refreshList();

      if (payload?.sender === "user") {
        toast(`New message on ${payload.ticketId}`, { duration: 6000, icon: "💬" });
        showAdminBrowserNotification({
          title: "Ticket reply",
          body: `New anonymous message on ${payload.ticketId}`,
          tag: `feedback-message-${payload.ticketId}`,
        });
      }

      refreshDetail();
    });

    return () => {
      socket.disconnect();
      setIsLive(false);
    };
  }, [onOpenTicket, onRefreshAnalytics, onRefreshDetail, onRefreshList, selectedId, token]);

  return { isLive };
};
