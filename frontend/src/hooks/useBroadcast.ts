import { useState, useCallback } from "react";
import { api } from "../api/client";

export function useBroadcast() {
  const [broadcastMsg, setBroadcastMsg] = useState<string>("");
  const [broadcasting, setBroadcasting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  const sendBroadcast = useCallback(async () => {
    if (!broadcastMsg.trim() || broadcastMsg.trim().length < 3) {
      setBroadcastSuccess("Message must be at least 3 characters.");
      return;
    }
    setBroadcasting(true);
    setBroadcastSuccess(null);
    try {
      const res = await api.post("/api/vendor-customers/broadcast", {
        title: "Message from Vendor",
        message: broadcastMsg,
      });
      const targeted = res.data?.data?.targeted;
      const delivered = res.data?.data?.inAppCreated;
      if (typeof targeted === "number" && typeof delivered === "number") {
        setBroadcastSuccess(
          `Message delivered to ${delivered} of ${targeted} customers.`
        );
      } else {
        setBroadcastSuccess("Message sent to all customers.");
      }
      setBroadcastMsg("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send message.";
      setBroadcastSuccess(msg);
    } finally {
      setBroadcasting(false);
    }
  }, [broadcastMsg]);

  return {
    broadcastMsg,
    setBroadcastMsg,
    broadcasting,
    broadcastSuccess,
    sendBroadcast,
  };
}