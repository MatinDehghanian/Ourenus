import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeRebeccaProfiles,
  normalizeUsageData,
  normalizeUserData,
} from "./dataAdapter.js";

test("normalizes Rebecca subscription info and usage", () => {
  const user = normalizeUserData({
    openvpn: { profiles: [] },
    user: {
      username: "alice",
      status: "active",
      used_traffic: 1024,
      lifetime_used_traffic: 2048,
      subscription_url: "/sub/token",
      links: ["vless://example"],
    },
  });

  assert.equal(user.username, "alice");
  assert.equal(user.is_rebecca, true);
  assert.equal(user.supports_usage_chart, true);
  assert.deepEqual(user.links, ["vless://example"]);
  assert.deepEqual(
    normalizeUsageData({
      usages: [{ date: "2026-08-26", used_traffic: 4096 }],
      hourly_usages: [],
    }),
    [{ timestamp: "2026-08-26", usedTraffic: 4096 }]
  );
  assert.deepEqual(normalizeUsageData({ usages: [], hourly_usages: [] }), []);
});

test("normalizes every Rebecca VPN protocol", () => {
  assert.deepEqual(normalizeRebeccaProfiles({ username: "legacy" }), []);
  assert.deepEqual(normalizeRebeccaProfiles({ user: { username: "wrapped" } }), []);

  const profiles = normalizeRebeccaProfiles({
    user: { username: "alice" },
    openvpn: {
      profiles: [{ remark: "OV Edge", download_url: "/ov/edge.ovpn" }],
    },
    wireguard: {
      profiles: [
        {
          host_name: "WG Edge",
          download_url: "/wg/edge.conf",
          link: "wireguard://profile",
        },
      ],
    },
    l2tp: [
      {
        host_name: "L2TP Edge",
        server: "l2tp.example.com",
        port: 1701,
        username: "alice",
        password: "secret",
        ipsec_psk: "shared-secret",
      },
    ],
    pptp: [{ server: "pptp.example.com", port: 1723 }],
    ikev2: [{ server: "ike.example.com", port: 500 }],
    anyconnect: [{ server: "cisco.example.com", port: 443 }],
  });

  assert.deepEqual(
    profiles.map(({ protocol }) => protocol),
    ["OpenVPN", "WireGuard", "L2TP/IPsec", "PPTP", "IKEv2", "Cisco AnyConnect"]
  );
  assert.equal(profiles[0].downloadUrl, "/ov/edge.ovpn");
  assert.equal(profiles[1].qrValue, "wireguard://profile");
  assert.match(profiles[2].details, /IPSec PSK: shared-secret/);
});

test("keeps other supported API formats out of Rebecca paths", () => {
  globalThis.window = {
    location: { origin: "https://panel.example", pathname: "/sub/token" },
  };
  const legacy = normalizeUserData({
    username: "legacy",
    used_traffic: 10,
    data_limit: 100,
    links: ["vless://legacy"],
  });
  const current = normalizeUserData({
    id: 7,
    username: "current",
    proxy_settings: {},
    lifetime_used_traffic: 20,
  });

  assert.equal(legacy.is_rebecca, undefined);
  assert.equal(legacy.supports_usage_chart, false);
  assert.deepEqual(legacy.links, ["vless://legacy"]);
  assert.equal(current.is_rebecca, undefined);
  assert.equal(current.is_pasarguard, true);
  assert.deepEqual(normalizeRebeccaProfiles(current), []);
  assert.deepEqual(normalizeUsageData({ stats: [] }), []);
  assert.deepEqual(
    normalizeUsageData({
      stats: {
        [-1]: [{ period_start: "2026-08-26", total_traffic: 512 }],
      },
    }),
    [{ timestamp: "2026-08-26", usedTraffic: 512 }]
  );
  delete globalThis.window;
});
