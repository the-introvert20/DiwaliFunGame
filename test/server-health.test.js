const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { spawn } = require("node:child_process");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

test("Colyseus Game Server - Health and API Endpoints", async (t) => {
  // Spawn the compiled game server
  const serverProcess = spawn("node", ["server/dist/index.js"], {
    env: { ...process.env, PORT: "2568" }, // use 2568 to avoid port collision
  });

  // Give server 1.5 seconds to bind
  await new Promise((r) => setTimeout(r, 1500));

  try {
    const health = await fetchJson("http://localhost:2568/health");
    assert.equal(health.status, 200);
    assert.equal(health.body.status, "online");
    assert.equal(health.body.platform, "DIWALIverse Arcade Game Server");
    assert.equal(health.body.roomsActive, true);

    const rooms = await fetchJson("http://localhost:2568/api/rooms");
    assert.equal(rooms.status, 200);
    assert.ok(Array.isArray(rooms.body.activeRooms));
    assert.equal(rooms.body.activeRooms.length, 3);
  } finally {
    serverProcess.kill("SIGTERM");
  }
});

