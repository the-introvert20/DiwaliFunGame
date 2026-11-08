import { HandPoint, DetectedGesture, DiwaliGestureType } from '@/types/diwali-cam';

function dist(p1: HandPoint, p2: HandPoint): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Check if a finger is extended relative to MCP and wrist
function isFingerExtended(tip: HandPoint, pip: HandPoint, mcp: HandPoint, wrist: HandPoint): boolean {
  const dTipWrist = dist(tip, wrist);
  const dPipWrist = dist(pip, wrist);
  const dTipMcp = dist(tip, mcp);
  const dPipMcp = dist(pip, mcp);
  return dTipWrist > dPipWrist * 1.15 && dTipMcp > dPipMcp * 1.25;
}

// Check if a finger is curled into the palm
function isFingerCurled(tip: HandPoint, pip: HandPoint, mcp: HandPoint, wrist: HandPoint): boolean {
  const dTipWrist = dist(tip, wrist);
  const dPipWrist = dist(pip, wrist);
  const dTipMcp = dist(tip, mcp);
  const dPipMcp = dist(pip, mcp);
  return dTipWrist <= dPipWrist * 1.1 || dTipMcp <= dPipMcp * 1.1;
}

export class GestureDetector {
  private lastGestures: DiwaliGestureType[] = [];
  private confirmationHistory: Map<DiwaliGestureType, number> = new Map();
  private lastTriggerTime: Map<DiwaliGestureType, number> = new Map();

  constructor() {
    this.confirmationHistory.set('fireworks', 0);
    this.confirmationHistory.set('rocket', 0);
    this.confirmationHistory.set('sparkler', 0);
    this.confirmationHistory.set('finale', 0);
    this.confirmationHistory.set('diya', 0);
  }

  public detectGestures(allHandLandmarks: HandPoint[][]): DetectedGesture[] {
    const results: DetectedGesture[] = [];
    if (!allHandLandmarks || allHandLandmarks.length === 0) {
      return results;
    }

    const now = Date.now();

    // 1. Check Both Hands Raised (Mega Finale)
    if (allHandLandmarks.length >= 2) {
      const h1 = allHandLandmarks[0];
      const h2 = allHandLandmarks[1];

      const h1Wrist = h1[0];
      const h2Wrist = h2[0];
      const h1IndexTip = h1[8];
      const h2IndexTip = h2[8];

      // Both hands raised in upper half of view
      const bothHandsHigh = h1Wrist.y < 0.7 && h2Wrist.y < 0.7 && h1IndexTip.y < 0.55 && h2IndexTip.y < 0.55;

      if (bothHandsHigh) {
        results.push({
          type: 'finale',
          confidence: 0.95,
          position: {
            x: (h1IndexTip.x + h2IndexTip.x) / 2,
            y: Math.min(h1IndexTip.y, h2IndexTip.y) - 0.05,
          },
          handIndex: 0,
          isTwoHanded: true,
        });
        return results;
      }
    }

    // 2. Per-hand gesture detection
    allHandLandmarks.forEach((landmarks, handIdx) => {
      if (!landmarks || landmarks.length < 21) return;

      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const thumbMcp = landmarks[2];

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

      // Distances
      const pinchDist = dist(thumbTip, indexTip);
      const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp, wrist);
      const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp, wrist);
      const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp, wrist);
      const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp, wrist);
      const thumbExtended = dist(thumbTip, indexMcp) > 0.12;

      const middleCurled = isFingerCurled(middleTip, middlePip, middleMcp, wrist);
      const ringCurled = isFingerCurled(ringTip, ringPip, ringMcp, wrist);
      const pinkyCurled = isFingerCurled(pinkyTip, pinkyPip, pinkyMcp, wrist);

      // Gesture 3: Pinch (Sparkler)
      // Distance between thumb tip and index tip is small
      if (pinchDist < 0.065) {
        results.push({
          type: 'sparkler',
          confidence: 0.9,
          position: {
            x: (thumbTip.x + indexTip.x) / 2,
            y: (thumbTip.y + indexTip.y) / 2,
          },
          handIndex: handIdx,
        });
        return;
      }

      // Gesture 5: Index Finger (Floating Diya)
      // Only index extended, other 3 fingers curled, thumb not pinching
      if (indexExtended && middleCurled && ringCurled && pinkyCurled && pinchDist > 0.08) {
        results.push({
          type: 'diya',
          confidence: 0.92,
          position: {
            x: indexTip.x,
            y: indexTip.y - 0.06, // Hovering slightly above fingertip
          },
          handIndex: handIdx,
        });
        return;
      }

      // Gesture 2: Peace Sign (Rocket Orbit)
      // Index and middle extended, ring and pinky curled
      if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
        const spread = dist(indexTip, middleTip);
        if (spread > 0.03) {
          results.push({
            type: 'rocket',
            confidence: 0.9,
            position: {
              x: (indexTip.x + middleTip.x) / 2,
              y: (indexTip.y + middleTip.y) / 2,
            },
            handIndex: handIdx,
          });
          return;
        }
      }

      // Gesture 1: Open Palm (Fireworks)
      // All 5 fingers extended outward
      if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
        const palmCenter = {
          x: (wrist.x + indexMcp.x + middleMcp.x + ringMcp.x + pinkyMcp.x) / 5,
          y: (wrist.y + indexMcp.y + middleMcp.y + ringMcp.y + pinkyMcp.y) / 5,
        };

        results.push({
          type: 'fireworks',
          confidence: 0.95,
          position: palmCenter,
          handIndex: handIdx,
        });
        return;
      }
    });

    return results;
  }
}

