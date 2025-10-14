import type { NextApiRequest, NextApiResponse } from "next";

import { AccessToken, IngressInput } from "livekit-server-sdk";
import { RoomServiceClient, IngressClient } from "livekit-server-sdk";
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
    BaseResponse<{ streamKey: string; url: string } | null, null>
  >,
  ingressService: IngressClient
) => {
  const identity = nanoid();
  const result = await ingressService.createIngress(IngressInput.RTMP_INPUT, {
    roomName: "default",
    participantIdentity: nanoid(),
    bypassTranscoding: false,
    enableTranscoding: true,
    participantMetadata: JSON.stringify({ identity }),
  });

  console.log(result);

  return res.status(200).json({
    code: "server:success",
    result: { streamKey: result.streamKey, url: result.url },
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

  const livekitHost = `https://${process.env.LIVEKIT_URL}`;
  const ingressService = new IngressClient(livekitHost, apiKey, apiSecret);

  switch (req.method) {
    case "GET":
      GetHandler(req, res, ingressService);
      break;
  }
}
