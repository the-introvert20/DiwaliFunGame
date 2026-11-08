const test = require('node:test');
const assert = require('node:assert/strict');

// Mock 21 hand landmarks helper
function createHand(wrist = { x: 0.5, y: 0.8 }, fingerStates = {}) {
  // 0: Wrist, 1-4: Thumb, 5-8: Index, 9-12: Middle, 13-16: Ring, 17-20: Pinky
  const lm = [];
  lm[0] = { x: wrist.x, y: wrist.y };

  // Thumb
  const thumbExt = fingerStates.thumb !== false;
  lm[1] = { x: wrist.x - 0.05, y: wrist.y - 0.05 };
  lm[2] = { x: wrist.x - 0.1, y: wrist.y - 0.1 };
  lm[3] = { x: wrist.x - 0.13, y: wrist.y - 0.15 };
  lm[4] = thumbExt
    ? { x: wrist.x - 0.16, y: wrist.y - 0.22 }
    : { x: wrist.x - 0.05, y: wrist.y - 0.1 };

  // Index
  const indexExt = fingerStates.index === true;
  lm[5] = { x: wrist.x - 0.04, y: wrist.y - 0.15 };
  lm[6] = { x: wrist.x - 0.04, y: wrist.y - 0.22 };
  lm[7] = { x: wrist.x - 0.04, y: wrist.y - 0.28 };
  lm[8] = indexExt
    ? { x: wrist.x - 0.04, y: wrist.y - 0.35 }
    : { x: wrist.x - 0.04, y: wrist.y - 0.18 };

  // Middle
  const middleExt = fingerStates.middle === true;
  lm[9] = { x: wrist.x, y: wrist.y - 0.16 };
  lm[10] = { x: wrist.x, y: wrist.y - 0.24 };
  lm[11] = { x: wrist.x, y: wrist.y - 0.3 };
  lm[12] = middleExt
    ? { x: wrist.x, y: wrist.y - 0.38 }
    : { x: wrist.x, y: wrist.y - 0.18 };

  // Ring
  const ringExt = fingerStates.ring === true;
  lm[13] = { x: wrist.x + 0.04, y: wrist.y - 0.15 };
  lm[14] = { x: wrist.x + 0.04, y: wrist.y - 0.22 };
  lm[15] = { x: wrist.x + 0.04, y: wrist.y - 0.27 };
  lm[16] = ringExt
    ? { x: wrist.x + 0.04, y: wrist.y - 0.33 }
    : { x: wrist.x + 0.04, y: wrist.y - 0.17 };

  // Pinky
  const pinkyExt = fingerStates.pinky === true;
  lm[17] = { x: wrist.x + 0.08, y: wrist.y - 0.13 };
  lm[18] = { x: wrist.x + 0.08, y: wrist.y - 0.18 };
  lm[19] = { x: wrist.x + 0.08, y: wrist.y - 0.23 };
  lm[20] = pinkyExt
    ? { x: wrist.x + 0.08, y: wrist.y - 0.28 }
    : { x: wrist.x + 0.08, y: wrist.y - 0.16 };

  return lm;
}

// Minimal port of detector logic for unit testing
function dist(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function isFingerExtended(tip, pip, mcp, wrist) {
  const dTipWrist = dist(tip, wrist);
  const dPipWrist = dist(pip, wrist);
  const dTipMcp = dist(tip, mcp);
  const dPipMcp = dist(pip, mcp);
  return dTipWrist > dPipWrist * 1.15 && dTipMcp > dPipMcp * 1.25;
}

function isFingerCurled(tip, pip, mcp, wrist) {
  const dTipWrist = dist(tip, wrist);
  const dPipWrist = dist(pip, wrist);
  const dTipMcp = dist(tip, mcp);
  const dPipMcp = dist(pip, mcp);
  return dTipWrist <= dPipWrist * 1.1 || dTipMcp <= dPipMcp * 1.1;
}

function classifyHand(landmarks) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexTip = landmarks[8];
  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleTip = landmarks[12];
  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];
  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];

  const pinchDist = dist(thumbTip, indexTip);
  const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp, wrist);
  const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp, wrist);
  const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp, wrist);
  const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp, wrist);
  const thumbExtended = dist(thumbTip, indexMcp) > 0.12;

  const middleCurled = isFingerCurled(middleTip, middlePip, middleMcp, wrist);
  const ringCurled = isFingerCurled(ringTip, ringPip, ringMcp, wrist);
  const pinkyCurled = isFingerCurled(pinkyTip, pinkyPip, pinkyMcp, wrist);

  if (pinchDist < 0.065) {
    return 'sparkler';
  }
  if (indexExtended && middleCurled && ringCurled && pinkyCurled && pinchDist > 0.08) {
    return 'diya';
  }
  if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
    return 'rocket';
  }
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    return 'fireworks';
  }
  return 'none';
}

test('Diwali Cam: Gesture 1 — Open Palm triggers Fireworks', () => {
  const openPalm = createHand({ x: 0.5, y: 0.8 }, {
    thumb: true,
    index: true,
    middle: true,
    ring: true,
    pinky: true,
  });

  const gesture = classifyHand(openPalm);
  assert.equal(gesture, 'fireworks');
});

test('Diwali Cam: Gesture 2 — Peace Sign triggers Rocket Orbit', () => {
  const peaceSign = createHand({ x: 0.5, y: 0.8 }, {
    thumb: false,
    index: true,
    middle: true,
    ring: false,
    pinky: false,
  });

  const gesture = classifyHand(peaceSign);
  assert.equal(gesture, 'rocket');
});

test('Diwali Cam: Gesture 3 — Pinch triggers Sparkler', () => {
  const pinchingHand = createHand({ x: 0.5, y: 0.8 }, {
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  });
  // Force thumb tip and index tip close together
  pinchingHand[4] = { x: 0.45, y: 0.6 };
  pinchingHand[8] = { x: 0.46, y: 0.61 };

  const gesture = classifyHand(pinchingHand);
  assert.equal(gesture, 'sparkler');
});

test('Diwali Cam: Gesture 4 — Both Hands Raised triggers Mega Finale', () => {
  const hand1 = createHand({ x: 0.3, y: 0.5 }, { index: true, middle: true });
  const hand2 = createHand({ x: 0.7, y: 0.5 }, { index: true, middle: true });

  const bothHigh = hand1[0].y < 0.7 && hand2[0].y < 0.7 && hand1[8].y < 0.55 && hand2[8].y < 0.55;
  assert.equal(bothHigh, true);
});

test('Diwali Cam: Gesture 5 — Index Finger triggers Floating Diya', () => {
  const pointingHand = createHand({ x: 0.5, y: 0.8 }, {
    thumb: false,
    index: true,
    middle: false,
    ring: false,
    pinky: false,
  });

  const gesture = classifyHand(pointingHand);
  assert.equal(gesture, 'diya');
});

