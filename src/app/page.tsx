"use client";
import { GridLayout } from "@/components/Layouts/GridLayout";
import { GetMediaDevices } from "@/components/Media/GetMediaDevices";
import { VideoTrackRenderer } from "@/components/Media/VideoTrackRenderer";
import { MainViewModel } from "@/logics";
import { Box, Button, Divider } from "@mantine/core";
import axios from "axios";
import { Participant, Track, VideoTrack } from "livekit-client";
import { useEffect, useMemo } from "react";
import { useViewModel } from "x-view-model";

export default function Home() {
  const [state, send, controller] = useViewModel(MainViewModel, [
    "local",
    "remotes",
  ]);

  useEffect(() => {
    send("setMicDevice", { id: "default", enabled: true, filter: false });
    send("setCamDevice", { id: "default", enabled: true });
  }, []);

  const { localVideoTrackReferences, remoteVideoTrackReferences } =
    useMemo(() => {
      const localParticipants: { track: Track; participant: Participant }[] =
        [];
      const remoteParticipants: { track: Track; participant: Participant }[] =
        [];

      if (controller.local && controller.localVideoTrack) {
        localParticipants.push({
          track: controller.localVideoTrack,
          participant: controller.local.participant,
        });
      }

      Object.keys(controller.remotes).forEach((k) => {
        const track = controller.remotes[k].camera?.track;
        if (track) {
          remoteParticipants.push({
            track,
            participant: controller.remotes[k].participant,
          });
        }
      });

      return {
        localVideoTrackReferences: localParticipants,
        remoteVideoTrackReferences: remoteParticipants,
      };
    }, [JSON.stringify(state.remotes), JSON.stringify(state.local)]);

  const sortedVideoItems = [
    ...localVideoTrackReferences,
    ...remoteVideoTrackReferences,
  ].map((d) => {
    return {
      id: `${d.participant.identity}-${d.track.source}`,
      type: "camera",
      identity: d.participant.identity,
      title: "",
      render: () => {
        return (
          <Box
            key={d.participant.identity}
            style={{
              width: `100%`,
              height: `100%`,

              borderRadius: "12px",
              flex: 1,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0px 1px 10px 1px rgba(0, 0, 0, 0.3)`,
              border: "rgba(0, 0, 0, 0.1)",
            }}
          >
            <VideoTrackRenderer track={d.track as VideoTrack} />
          </Box>
        );
      },
    };
  });

  return (
    <Box style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Box
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          style={{ width: "100%", height: "100%", flex: 1, overflow: "hidden" }}
        >
          <GridLayout items={[...sortedVideoItems]} />
        </Box>
        <Divider />
        <Box style={{ padding: "1rem", display: "flex", gap: "12px" }}>
          <Box style={{ flex: 1 }} />
          <Button
            onClick={async () => {
              send("getStreamKey", undefined);
            }}
          >
            STREAM KEY
          </Button>
          <Button
            onClick={async () => {
              send("connect", undefined);
            }}
          >
            연결
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
