const isBrowser = typeof window !== "undefined";

export const getAdminNotificationPermission = () => {
  if (!isBrowser || typeof Notification === "undefined") {
    return "unsupported";
  }

  return Notification.permission;
};

export const requestAdminNotificationPermission = async () => {
  const current = getAdminNotificationPermission();

  if (current === "unsupported") {
    return current;
  }

  if (current === "granted" || current === "denied") {
    return current;
  }

  return Notification.requestPermission();
};

export const showAdminBrowserNotification = ({ title, body, tag, onClick }) => {
  if (!isBrowser || typeof Notification === "undefined") {
    return null;
  }

  if (Notification.permission !== "granted" || document.visibilityState === "visible") {
    return null;
  }

  const notification = new Notification(title, {
    body,
    tag,
  });

  notification.onclick = () => {
    window.focus();
    onClick?.();
    notification.close();
  };

  return notification;
};
