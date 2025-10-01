import { registViewModel } from "x-view-model";
import { ParticipantState, RealtimeController } from "./RealtimeController";
import axios from "axios";
import { LocalAudioTrack, LocalVideoTrack } from "livekit-client";

export class MainController extends RealtimeController {
  constructor() {
    super();

    this.on("message", ({ target, action }) => {
      //
    });
    this.on("local_join", (args) => {
      //
    });
    this.on("remote_join", (args) => {
      // this.context!.remotes[args.metadata.identity] = {
      //   camera: { enabled: undefined, muted: undefined },
      //   microphone: { enabled: undefined, muted: undefined },
      //   metadata: args.metadata,
      // };
    });

    this.on("remote_leave", (args) => {
      // delete this.context!.remotes[args.identity];
    });

    this.on("local_update", (args) => {
      //
    });

    this.on("remote_update", (args) => {
      //
    });
    this.on("status", (status) => {
      //
    });
  }
}

export type MainContext = {
  local: ParticipantState;
  remotes: Record<string, ParticipantState>;
  getStreamKey: () => Promise<void>;
  connect: () => Promise<void>;
  micDevice: {
    id: string;
    enabled: boolean;
    filter: boolean;
    pending?: boolean;
  };
  camDevice: {
    id: string;
    enabled: boolean;
    pending?: boolean;
  };

  setMicDevice: (payload: {
    id: string;
    enabled: boolean;
    filter: boolean;
  }) => Promise<void>;
  setCamDevice: (payload: { id: string; enabled: boolean }) => Promise<void>;
};

const controller = new MainController();

export const MainViewModel = registViewModel<MainContext, MainController>(
  {
    async getStreamKey() {
      const { data } = await axios.get("/api/stream");
      console.log(data);
    },
    async connect() {
      await controller.disconnect();

      const { data } = await axios.get("/api/access");

      console.log(data);

      await controller.connect(
        data.result.url,
        data.result.token,
        {
          remotes: this.remotes,
          local: this.local,
        },
        this.micDevice,
        this.camDevice
      );
    },
    local: {
      metadata: {},
      camera: {
        muted: false,
        enabled: false,
      },
      microphone: {
        muted: false,
        enabled: false,
      },
    },
    remotes: {},
    micDevice: {
      id: "default",
      enabled: false,
      filter: false,
    },
    camDevice: {
      id: "default",
      enabled: false,
    },

    setMicDevice: async function (payload: {
      id: string;
      enabled: boolean;
      filter: boolean;
    }) {
      this.micDevice.pending = true;
      if (!controller.localAudioTrack) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: payload.id,
            sampleRate: 48000,
          },
          video: false,
        });

        const tracks = stream.getAudioTracks();

        if (tracks.length > 0) {
          const mediaTrack = tracks[0];

          const track = new LocalAudioTrack(mediaTrack, {
            deviceId: payload.id,
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true,
            sampleRate: 48000,
          });

          const deviceID = await track.getDeviceId();
          payload.id = deviceID ? deviceID : "default";
          controller.localAudioTrack = track;
        }
      } else {
        await controller.localAudioTrack.setDeviceId(payload.id);
      }

      if (payload.enabled) {
        controller.localAudioTrack?.unmute();
      } else {
        controller.localAudioTrack?.mute();
      }

      this.micDevice = {
        ...payload,
        pending: false,
      };
    },
    setCamDevice: async function (payload: { id: string; enabled: boolean }) {
      this.camDevice.pending = true;
      if (!controller.localVideoTrack) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: payload.id,
          },
          audio: false,
        });

        const tracks = stream.getVideoTracks();

        if (tracks.length > 0) {
          const mediaTrack = tracks[0];
          const localVideoTrack = new LocalVideoTrack(
            mediaTrack,
            {
              deviceId: payload.id,
            },
            true
          );
          const deviceID = await localVideoTrack.getDeviceId();
          payload.id = deviceID ? deviceID : "default";
          controller.localVideoTrack = localVideoTrack;
        }
      } else {
        await controller.localVideoTrack.setDeviceId(payload.id);
      }

      if (payload.enabled) {
        controller.localVideoTrack?.unmute();
      } else {
        controller.localVideoTrack?.mute();
      }

      this.camDevice = { ...payload, pending: false };
    },
  },
  { deep: true, name: "MainViewModel" },
  controller
);
