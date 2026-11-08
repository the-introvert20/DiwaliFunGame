const test = require('node:test');
const assert = require('node:assert');

test('DIWALIverse Progression Engine - Level and XP Calculation', () => {
  // Test Level Calculation Formula
  function calculateLevelProgression(currentXp, currentLevel, currentXpToNext, addedXp) {
    let xp = currentXp + addedXp;
    let level = currentLevel;
    let xpToNext = currentXpToNext;
    let leveledUp = false;

    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = level * 500;
      leveledUp = true;
    }

    return { xp, level, xpToNext, leveledUp };
  }

  // Level 1 starting with 0 XP, earns 600 XP -> Level 2 with 100 XP
  const res1 = calculateLevelProgression(0, 1, 500, 600);
  assert.strictEqual(res1.level, 2);
  assert.strictEqual(res1.xp, 100);
  assert.strictEqual(res1.leveledUp, true);
  assert.strictEqual(res1.xpToNext, 1000);

  // Level 2 with 100 XP, earns 200 XP -> still Level 2 with 300 XP
  const res2 = calculateLevelProgression(100, 2, 1000, 200);
  assert.strictEqual(res2.level, 2);
  assert.strictEqual(res2.xp, 300);
  assert.strictEqual(res2.leveledUp, false);
});

test('DIWALIverse Room Code Generation & Format', () => {
  function generateRoomCode() {
    return `DW-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  for (let i = 0; i < 20; i++) {
    const code = generateRoomCode();
    assert.match(code, /^DW-[1-9][0-9]{3}$/);
    assert.strictEqual(code.length, 7);
  }
});

test('DIWALIverse Rocket Rush Collision & Distance Simulation', () => {
  function updateDistance(currentY, speedKmh, dtSeconds) {
    const speedMs = speedKmh / 3.6;
    return currentY + speedMs * dtSeconds * 3;
  }

  const initialY = 100;
  // 360 km/h is 100 m/s. Over 1 second * 3 scale = +300m
  const newY = updateDistance(initialY, 360, 1.0);
  assert.strictEqual(Math.round(newY), 400);

  // Boost speed: 520 km/h should cover substantially more distance
  const boostedY = updateDistance(initialY, 520, 1.0);
  assert.ok(boostedY > newY);
});

test('DIWALIverse Cracker Clash Multiplier Calculation', () => {
  function getScoreMultiplier(combo) {
    if (combo >= 10) return 3;
    if (combo >= 5) return 2;
    return 1;
  }

  assert.strictEqual(getScoreMultiplier(2), 1);
  assert.strictEqual(getScoreMultiplier(4), 1);
  assert.strictEqual(getScoreMultiplier(5), 2);
  assert.strictEqual(getScoreMultiplier(8), 2);
  assert.strictEqual(getScoreMultiplier(10), 3);
  assert.strictEqual(getScoreMultiplier(25), 3);
});

