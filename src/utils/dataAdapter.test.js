import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUsageData, normalizeUserData } from "./dataAdapter.js";

test("normalizes Rebecca subscription info and usage", () => {
  const user = normalizeUserData({
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
