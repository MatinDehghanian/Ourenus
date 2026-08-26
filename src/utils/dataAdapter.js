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

function isRebeccaApiFormat(data) {
  return data?.user && typeof data.user === "object";
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

  if (isRebeccaApiFormat(rawData)) {
    return {
      ...rawData,
      ...rawData.user,
      is_pasarguard: false,
      is_rebecca: true,
      supports_usage_chart: true,
      subscription_url:
        rawData.user.subscription_url || deriveSubscriptionUrl(),
      links: Array.isArray(rawData.user.links) ? rawData.user.links : null,
    };
  }

  // --- Legacy format: pass through with minimal patching ---
  if (!isNewApiFormat(rawData)) {
    return {
      ...rawData,
      is_pasarguard: false,
      supports_usage_chart: false,
      // Ensure subscription_url always exists
      subscription_url:
        rawData.subscription_url || deriveSubscriptionUrl(),
    };
  }

  // --- New API format ---
  return {
    is_pasarguard: true,
    supports_usage_chart: true,
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

export function normalizeUsageData(rawData, preferHourly = false) {
  const stats = rawData?.stats;
  let items;

  if (Array.isArray(stats)) {
    items = stats;
  } else if (stats && typeof stats === "object") {
    items = stats[-1] || Object.values(stats)[0] || [];
  } else if (preferHourly && rawData?.hourly_usages?.length) {
    items = rawData.hourly_usages;
  } else {
    items = rawData?.usages || [];
  }

  return items
    .map((item) => ({
      timestamp: item.period_start ?? item.timestamp ?? item.date,
      usedTraffic: item.total_traffic ?? item.used_traffic ?? 0,
    }))
    .filter((item) => item.timestamp);
}

export function normalizeRebeccaProfiles(rawData) {
  if (!isRebeccaApiFormat(rawData)) return [];

  const profiles = [];
  const addDownloadProfiles = (protocol, items = []) => {
    items.forEach((item, index) => {
      profiles.push({
        protocol,
        name:
          item.host_name ||
          item.remark ||
          item.filename ||
          `${protocol} ${index + 1}`,
        downloadUrl: item.download_url,
        qrValue: item.link,
      });
    });
  };

  addDownloadProfiles("OpenVPN", rawData.openvpn?.profiles);
  addDownloadProfiles("WireGuard", rawData.wireguard?.profiles);

  const remoteProtocols = {
    l2tp: "L2TP/IPsec",
    pptp: "PPTP",
    ikev2: "IKEv2",
    anyconnect: "Cisco AnyConnect",
  };
  Object.entries(remoteProtocols).forEach(([key, protocol]) => {
    (rawData[key] || []).forEach((item, index) => {
      const fields = [
        ["Server", item.server],
        ["Port", item.port],
        ["Username", item.username],
        ["Password", item.password],
        ["Auth mode", item.auth_mode],
        ["IPSec PSK", item.ipsec_psk],
        ["IKE port", item.ike_port],
        ["NAT-T port", item.natt_port],
        ["Tunnel port", item.tunnel_port],
        ["DNS", item.dns?.join(", ")],
      ].filter(([, value]) => value !== undefined && value !== null && value !== "");
      profiles.push({
        protocol,
        name: item.host_name || item.remark || `${protocol} ${index + 1}`,
        details: fields.map(([label, value]) => `${label}: ${value}`).join("\n"),
      });
    });
  });

  return profiles;
}
