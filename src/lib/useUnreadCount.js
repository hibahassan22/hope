import { useState, useEffect } from "react";
import { subscribeNotifications } from "../services/notifications";

/**
 * Shared hook — any component can call this to get
 * the real-time unread count from Firestore.
 */
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeNotifications(items => {
      setCount(items.filter(n => !n.read).length);
    });
    return unsub;
  }, []);

  return count;
}