import { NextRequest, NextResponse } from 'next/server';

// In-memory signaling store for multi-device WebRTC peer connections
// Works across separate devices, phones, laptops, and networks without external credentials!

interface SignalMessage {
  id: string;
  room: string;
  senderId: string;
  senderName: string;
  targetId?: string; // target peer id or undefined for broadcast
  type: 'JOIN' | 'LEAVE' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'CHAT' | 'CELEBRATION';
  payload?: any;
  timestamp: number;
}

// Global store with TTL cleanup
const roomMessages: Map<string, SignalMessage[]> = new Map();
const roomPeers: Map<string, Map<string, { id: string; name: string; lastSeen: number }>> = new Map();

// Periodic prune older than 2 minutes
function pruneOldSignals(room: string) {
  const now = Date.now();
  const msgs = roomMessages.get(room) || [];
  roomMessages.set(
    room,
    msgs.filter((m) => now - m.timestamp < 60000)
  );

  const peers = roomPeers.get(room);
  if (peers) {
    peers.forEach((peer, id) => {
      if (now - peer.lastSeen > 30000) {
        peers.delete(id);
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room: rawRoom, senderId, senderName, targetId, type, payload } = body;

    if (!rawRoom || !senderId || !type) {
      return NextResponse.json({ error: 'Missing required signaling fields' }, { status: 400 });
    }

    const room = rawRoom.trim().toUpperCase();
    const now = Date.now();

    pruneOldSignals(room);

    // Update peer heartbeat
    if (!roomPeers.has(room)) {
      roomPeers.set(room, new Map());
    }
    roomPeers.get(room)!.set(senderId, {
      id: senderId,
      name: senderName || 'Guest',
      lastSeen: now,
    });

    // Store message
    if (!roomMessages.has(room)) {
      roomMessages.set(room, []);
    }

    const msg: SignalMessage = {
      id: Math.random().toString(36).substring(2, 9),
      room,
      senderId,
      senderName: senderName || 'Guest',
      targetId,
      type,
      payload,
      timestamp: now,
    };

    roomMessages.get(room)!.push(msg);

    // If LEAVE, remove peer
    if (type === 'LEAVE') {
      roomPeers.get(room)?.delete(senderId);
    }

    return NextResponse.json({ success: true, messageId: msg.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawRoom = searchParams.get('room');
    const peerId = searchParams.get('peerId');
    const since = parseInt(searchParams.get('since') || '0', 10);

    if (!rawRoom || !peerId) {
      return NextResponse.json({ error: 'Missing room or peerId query' }, { status: 400 });
    }

    const room = rawRoom.trim().toUpperCase();
    const now = Date.now();

    pruneOldSignals(room);

    // Heartbeat
    if (roomPeers.has(room) && roomPeers.get(room)!.has(peerId)) {
      roomPeers.get(room)!.get(peerId)!.lastSeen = now;
    }

    const allMsgs = roomMessages.get(room) || [];
    // Filter messages intended for this peer (or broadcast) and after 'since'
    const newMsgs = allMsgs.filter(
      (m) =>
        m.timestamp > since &&
        m.senderId !== peerId &&
        (!m.targetId || m.targetId === peerId)
    );

    const activePeers = Array.from(roomPeers.get(room)?.values() || []).filter(
      (p) => p.id !== peerId && now - p.lastSeen < 25000
    );

    return NextResponse.json({
      messages: newMsgs,
      peers: activePeers,
      serverTime: now,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
