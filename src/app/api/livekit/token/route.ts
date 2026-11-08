import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const room = body.room?.trim().toUpperCase();
    const username = body.username?.trim() || 'Festive Guest';

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
            'LiveKit Cloud keys not configured in environment. Multi-device WebRTC fallback active.',
        },
        { status: 200 }
      );
    }

    // Generate a unique identity per connection to prevent any collision
    const sanitizedName = username.replace(/[^a-zA-Z0-9_-]/g, '') || 'Guest';
    const uniqueIdentity = `${sanitizedName}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: uniqueIdentity,
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

