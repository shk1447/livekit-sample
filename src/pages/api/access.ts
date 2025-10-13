import type { NextApiRequest, NextApiResponse } from "next";

import { AccessToken } from "livekit-server-sdk";
import { RoomServiceClient } from "livekit-server-sdk";
import { nanoid } from "nanoid";
import { BaseResponse } from "@/types/BaseResponse";

const getAccessInfo = async (roomName: string) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: nanoid(),
    ttl: "10m",
    metadata: "",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: false,
  });
  const token = await at.toJwt();
  return { token };
};

const GetHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    BaseResponse<{ token: string; url: string } | null, null>
  >,
  roomService: RoomServiceClient
) => {
  const wsUrl = `ws://${process.env.LIVEKIT_URL}`;
  const accessInfo = await getAccessInfo("default");

  return res.status(200).json({
    code: "server:success",
    result: { token: accessInfo.token, url: wsUrl },
    metadata: null,
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ code: "server:error", result: null });
  }

  const livekitHost = `http://${process.env.LIVEKIT_URL}`;
  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  switch (req.method) {
    case "GET":
      GetHandler(req, res, roomService);
      break;
  }
}
