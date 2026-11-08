import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room, username } = body;

    if (!room || !username) {
      return NextResponse.json(
        { error: 'Missing room or username parameter' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    // Check if LiveKit credentials are configured
    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        {
          configured: false,
          error: 'LIVEKIT_NOT_CONFIGURED',
          message:
            'LiveKit Cloud keys not configured in environment. Peer-to-peer WebRTC fallback active.',
        },
        { status: 200 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      configured: true,
      token,
      wsUrl,
    });
  } catch (err: any) {
    console.error('Error generating LiveKit token:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}
