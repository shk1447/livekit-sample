"use client";
import { Box, Button, Divider } from "@mantine/core";
import axios from "axios";

export default function Home() {
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
        <Box style={{ padding: "1rem", display: "flex" }}>
          <Box style={{ flex: 1 }} />
          <Button
            onClick={async () => {
              const { data } = await axios.get("/api/access");
              console.log(data);
            }}
          >
            연결
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
