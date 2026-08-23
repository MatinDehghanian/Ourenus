/**
 * Normalizes API response data into a consistent internal format.
 * Supports both the new API shape (Marzban v0.8+) and the legacy format.
 *
 * New API shape:
 *   { id, username, status, used_traffic, data_limit, expire (ISO string),
 *     lifetime_used_traffic, created_at, edit_at, online_at, ip,
 *     proxy_settings, data_limit_reset_strategy, on_hold_expire_duration,
 *     on_hold_timeout, group_ids, hwid_limit, next_plan }
 *
 * Legacy API shape:
 *   { username, status?, used_traffic, data_limit, expire (unix ts),
 *     subscription_url, links, expired, data_limit_reached, enabled,
 *     is_active, activated, ... }
 */

/**
 * Detects whether the response is from the new API format.
 * The new API always includes `proxy_settings` and `id` at the top level.
 */
function isNewApiFormat(data) {
  return data && ("proxy_settings" in data || "lifetime_used_traffic" in data);
}

/**
 * Build the subscription URL from the current page URL.
 * The sub page lives at e.g. /sub/{token} — the same path serves both
 * the info JSON (at /sub/{token}/info) and the raw configs (at /sub/{token}).
 */
function deriveSubscriptionUrl() {
  const origin =
    import.meta.env?.VITE_PANEL_DOMAIN || window.location.origin;
  const pathname = window.location.pathname.split("#")[0];
  // Remove trailing `/info` if present (the info endpoint appends it)
  const basePath = pathname.replace(/\/info\/?$/, "");
  return `${origin}${basePath}`;
}

/**
 * Normalize the API response into the shape consumed by the UI.
 *
 * @param {object} rawData - The raw API response object.
 * @returns {object} Normalized data.
 */
export function normalizeUserData(rawData) {
  if (!rawData) return null;

  // --- Legacy format: pass through with minimal patching ---
  if (!isNewApiFormat(rawData)) {
    return {
      ...rawData,
      // Ensure subscription_url always exists
      subscription_url:
        rawData.subscription_url || deriveSubscriptionUrl(),
    };
  }

  // --- New API format ---
  return {
    // Identity
    id: rawData.id,
    username: rawData.username,

    // Status — the new API provides this directly
    status: rawData.status, // "active" | "disabled" | "limited" | "expired" | "on_hold"

    // Traffic (bytes)
    used_traffic: rawData.used_traffic ?? 0,
    data_limit: rawData.data_limit === 0 ? null : rawData.data_limit, // 0 means unlimited in new API
    lifetime_used_traffic: rawData.lifetime_used_traffic ?? 0,
    data_limit_reset_strategy: rawData.data_limit_reset_strategy,

    // Expiry — keep as-is (ISO string); Helper.js already handles both formats
    expire: rawData.expire ?? null,

    // On-hold specifics
    on_hold_expire_duration: rawData.on_hold_expire_duration,
    on_hold_timeout: rawData.on_hold_timeout,

    // Subscription URL — derived from current page
    subscription_url: deriveSubscriptionUrl(),

    // Links are no longer embedded; the UI will fetch them via getConfigs()
    links: null,

    // Proxy settings (new)
    proxy_settings: rawData.proxy_settings,

    // Metadata
    created_at: rawData.created_at,
    edit_at: rawData.edit_at,
    online_at: rawData.online_at,
    ip: rawData.ip,
    hwid_limit: rawData.hwid_limit,
    group_ids: rawData.group_ids,
    next_plan: rawData.next_plan,
  };
}
