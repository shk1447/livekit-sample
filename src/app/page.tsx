"use client";
import { MainViewModel } from "@/logics";
import { Box, Button, Divider } from "@mantine/core";
import axios from "axios";
import { useViewModel } from "x-view-model";

export default function Home() {
  const [state, send, controller] = useViewModel(MainViewModel, [
    "local",
    "remotes",
  ]);
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
        <Box style={{ width: "100%", height: "100%", flex: 1 }}>AA</Box>
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
