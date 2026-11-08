const test = require('node:test');
const assert = require('node:assert/strict');
const { AccessToken } = require('livekit-server-sdk');

test('LiveKit Server SDK: Token generation generates valid JWT', async () => {
  const at = new AccessToken('devkey', 'secret', {
    identity: 'TestUser',
    name: 'TestUser',
  });

  at.addGrant({
    roomJoin: true,
    room: 'DIWALI-TEST-ROOM',
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  assert.ok(typeof token === 'string');
  assert.ok(token.split('.').length === 3, 'JWT should have 3 segments');
});

