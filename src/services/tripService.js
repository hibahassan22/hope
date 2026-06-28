const API_BASE = "/api";

async function parseJsonResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      (typeof json?.errors === "object"
        ? Object.values(json.errors).flat().join(" — ")
        : null) ||
      `خطأ ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

/** POST /api/tripwithoutdriver/create */
export async function createTripWithoutDriver(payload) {
  const res = await fetch(`${API_BASE}/tripwithoutdriver/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

/** POST /api/trip/passenger/request-add */
export async function requestAddPassenger(payload) {
  const res = await fetch(`${API_BASE}/trip/passenger/request-add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

/** DELETE /api/trip/passenger/request-delete */
export async function requestDeletePassenger({ tripId, customerId }) {
  const res = await fetch(`${API_BASE}/trip/passenger/request-delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      trip_id: Number(tripId),
      customer_id: Number(customerId),
    }),
  });
  return parseJsonResponse(res);
}

import { fetchCustomersList } from "./customerService.js";

/** @deprecated استخدم fetchCustomersList */
export async function fetchAllCustomers() {
  return fetchCustomersList();
}
