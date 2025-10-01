/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LocalAudioTrack,
  LocalParticipant,
  LocalTrackPublication,
  LocalVideoTrack,
  ParticipantEvent,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

import { EventHandler } from "./EventHandler";

export type GetFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type GetFunctionParams<T> = {
  [K in keyof T]: T[K] extends (...args: any) => void
    ? Parameters<T[K]>[0]
    : any;
};

export type ParticipantState = {
  camera: DeviceState;
  microphone: DeviceState;
  metadata: unknown;
};

export type ViewContexts = unknown;

export type TrackRemoteReferenceByVases = {
  participant: RemoteParticipant;
  camera?: {
    track: RemoteVideoTrack;
    publication: RemoteTrackPublication;
  };
  microphone?: {
    track: RemoteAudioTrack;
    publication: RemoteTrackPublication;
  };
};
export type TrackLocalReferenceByVases = {
  participant: LocalParticipant;
  camera?: {
    track: LocalVideoTrack;
    publication: LocalTrackPublication;
  };
  microphone?: {
    track: LocalAudioTrack;
    publication: LocalTrackPublication;
  };
};

export type DeviceState = {
  enabled?: boolean;
  muted?: boolean;
};

// 각 이벤트 타입에 따른 payload 타입 정의
export interface RealtimeEventPayloads {
  local_join: {
    metadata: any;
  };
  remote_join: {
    metadata: any;
  };
  remote_leave: {
    identity: string;
  };
  local_update: {
    metadata?: any;
    camera: DeviceState;
    microphone: DeviceState;
  };

  remote_update: {
    identity: string;
    metadata?: any;
    camera: DeviceState;
    microphone: DeviceState;
  };
  message: { target: string; action: any };
  status: "LOADING" | "LOADED" | "DISCONNECTED";
}

export class RealtimeController extends EventHandler<RealtimeEventPayloads> {
  room?: Room;
  localVideoTrack?: LocalVideoTrack;
  localAudioTrack?: LocalAudioTrack;
  audioContext?: AudioContext;
  local?: TrackLocalReferenceByVases;
  remotes: Record<string, TrackRemoteReferenceByVases>;
  context?: {
    local: ParticipantState;
    remotes: Record<string, ParticipantState>;
  };

  constructor() {
    super();

    this.remotes = {};
  }

  // only local
  async publishAudio(device: { id: string; enabled: boolean }) {
    if (this.local && this.localAudioTrack) {
      const publication = await this.local.participant.publishTrack(
        this.localAudioTrack,
        {
          source: Track.Source.Microphone,
        }
      );

      if (!device.enabled) {
        publication.mute();
      }
    }
  }

  // only local
  async publishVideo(device: { id: string; enabled: boolean }) {
    if (this.local && this.localVideoTrack) {
      const publication = await this.local.participant.publishTrack(
        this.localVideoTrack,
        {
          source: Track.Source.Camera,
        }
      );

      if (!device.enabled) {
        publication.mute();
      }
    }
  }

  addRemoteEventHandler(remote: TrackRemoteReferenceByVases) {
    const id = remote.participant.identity;

    remote.participant.on(
      ParticipantEvent.TrackSubscribed,
      (track, publication) => {
        if (track instanceof RemoteAudioTrack) {
          if (track.source === Track.Source.Microphone) {
            remote.microphone!.track = track;
            this.context!.remotes[id].microphone.enabled = true;
          }
        } else if (track instanceof RemoteVideoTrack) {
          if (track.source === Track.Source.Camera) {
            remote.camera!.track = track;
            this.context!.remotes[id].camera.enabled = true;
          }
        }
      }
    );

    remote.participant.on(
      ParticipantEvent.TrackUnsubscribed,
      (track, publication) => {
        if (track instanceof RemoteAudioTrack) {
          if (track.source === Track.Source.Microphone) {
            remote.microphone!.track = track;
            this.context!.remotes[id].microphone.enabled = false;
          }
        } else if (track instanceof RemoteVideoTrack) {
          if (track.source === Track.Source.Camera) {
            remote.camera!.track = track;
            this.context!.remotes[id].camera.enabled = false;
          }
        }
      }
    );

    remote.participant.on(ParticipantEvent.TrackMuted, (track) => {
      if (track.source === Track.Source.Microphone) {
        this.context!.remotes[id].microphone.muted = true;
      } else if (track.source === Track.Source.Camera) {
        this.context!.remotes[id].camera.muted = true;
      }
    });
    remote.participant.on(ParticipantEvent.TrackUnmuted, (track) => {
      if (track.source === Track.Source.Microphone) {
        this.context!.remotes[id].microphone.muted = false;
      } else if (track.source === Track.Source.Camera) {
        this.context!.remotes[id].camera.muted = false;
      }
    });

    remote.participant.on(ParticipantEvent.TrackPublished, (publication) => {
      if (publication.kind === Track.Kind.Video) {
        remote.camera = {
          publication: publication,
          track: publication.videoTrack as RemoteVideoTrack,
        };
        this.context!.remotes[id].camera = {
          enabled: false,
          muted: undefined,
        };
      } else if (publication.kind === Track.Kind.Audio) {
        remote.microphone = {
          publication: publication,
          track: publication.audioTrack as RemoteAudioTrack,
        };
        this.context!.remotes[id].microphone = {
          enabled: false,
          muted: undefined,
        };
      }
      publication.setSubscribed(true);
    });
    remote.participant.on(ParticipantEvent.TrackUnpublished, (publication) => {
      if (publication.kind === Track.Kind.Video) {
        remote.camera = undefined;
        this.context!.remotes[id].camera = {
          enabled: undefined,
          muted: undefined,
        };
      } else if (publication.kind === Track.Kind.Audio) {
        remote.microphone = undefined;
        this.context!.remotes[id].microphone = {
          enabled: undefined,
          muted: undefined,
        };
      }
      publication.setSubscribed(false);
    });
    remote.participant.on(ParticipantEvent.ConnectionQualityChanged, (q) => {
      // console.log(q);
    });

    remote.participant.trackPublications.forEach((publication) => {
      // 퍼블리셔가 있나없나!?ㅎ
      if (publication.kind === Track.Kind.Video) {
        remote.camera = {
          publication: publication as RemoteTrackPublication,
          track: publication.videoTrack as RemoteVideoTrack,
        };
        this.context!.remotes[id].camera = {
          enabled: publication.isSubscribed,
          muted: publication.isMuted,
        };
      } else if (publication.kind === Track.Kind.Audio) {
        remote.microphone = {
          publication: publication as RemoteTrackPublication,
          track: publication.audioTrack as RemoteAudioTrack,
        };
        this.context!.remotes[id].microphone = {
          enabled: publication.isSubscribed,
          muted: publication.isMuted,
        };
      }
      publication.setSubscribed(true);
    });
  }
  async disconnect() {
    if (this.room) {
      await this.room.disconnect(true);
    }
  }

  async connect(
    url: string,
    token: string,
    context: {
      local: ParticipantState;
      remotes: Record<string, ParticipantState>;
    },
    micDevice?: {
      id: string;
      enabled: boolean;
    },
    camDevice?: {
      id: string;
      enabled: boolean;
    }
  ) {
    this.context = context;
    this.emit("status", "LOADING");

    this.audioContext = new AudioContext({ sampleRate: 48000 });
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,

      audioCaptureDefaults: {
        deviceId: micDevice ? micDevice.id : "default",
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      videoCaptureDefaults: {
        deviceId: camDevice ? camDevice.id : "default",
      },
      webAudioMix: {
        audioContext: this.audioContext,
      },
    });

    this.room = room;

    const decoder = new TextDecoder();
    room.addListener(
      RoomEvent.DataReceived,
      (payload, participant, kind, topic) => {
        try {
          const strData = decoder.decode(payload);
          const data = JSON.parse(strData) as {
            target: keyof ViewContexts;
            // publishData 쪽에서 타입이 정의가 되었기에 일단 여기는 any로 처리
            action: {
              name: string;
              payload: any;
            };
          };
          if (participant?.hasMetadata) {
            try {
              const metadata = JSON.parse(participant!.metadata as string);
              data.action.payload.metadata = metadata;
            } catch (error) {
              // noop
            }
          }

          this.emit("message", { target: data.target, action: data.action });
          // this.emit(data.target, data.action);
        } catch (error) {
          console.log(error);
        }
      }
    );

    room.addListener(RoomEvent.Connected, async () => {
      this.local = {
        participant: room.localParticipant,
      };

      const metadata = this.local.participant.metadata
        ? (JSON.parse(this.local.participant.metadata) as any)
        : undefined;
      // this.context!.local.metadata = metadata;
      // const { KrispNoiseFilter } = await import("@livekit/krisp-noise-filter");

      this.local.participant.on(
        ParticipantEvent.LocalTrackPublished,
        async (publication) => {
          if (this.local) {
            if (publication.kind === Track.Kind.Video) {
              this.local.camera = {
                publication: publication,
                track: publication.videoTrack as LocalVideoTrack,
              };
              this.context!.local.camera.enabled = true;
            } else if (publication.kind === Track.Kind.Audio) {
              this.local.microphone = {
                publication: publication,
                track: publication.audioTrack as LocalAudioTrack,
              };
              this.context!.local.microphone.enabled = true;
              // const krispProcessor = KrispNoiseFilter();
              // console.log("Enabling LiveKit Krisp noise filter");
              // await publication.audioTrack?.setProcessor(krispProcessor);
            }
          }
        }
      );

      this.local.participant.on(
        ParticipantEvent.LocalTrackUnpublished,
        (publication) => {
          if (this.local) {
            if (publication.kind === Track.Kind.Video) {
              this.local.camera = undefined;
              this.context!.local.camera.enabled = false;
            } else if (publication.kind === Track.Kind.Audio) {
              this.local.microphone = undefined;
              this.context!.local.microphone.enabled = false;
            }
          }
        }
      );

      this.local.participant.on(ParticipantEvent.TrackMuted, (track) => {
        if (track.source === Track.Source.Camera) {
          this.context!.local.camera.muted = true;
        } else if (track.source === Track.Source.Microphone) {
          this.context!.local.microphone.muted = true;
        }

        // this.context!.local.camera.muted = true;
      });
      this.local.participant.on(ParticipantEvent.TrackUnmuted, (track) => {
        // this.context!.local.camera.muted = false;
        if (track.source === Track.Source.Camera) {
          this.context!.local.camera.muted = false;
        } else if (track.source === Track.Source.Microphone) {
          this.context!.local.microphone.muted = false;
        }
      });
      this.context!.local.metadata = metadata;

      this.emit("local_join", {
        metadata: metadata!,
      });

      if (micDevice) {
        await this.publishAudio(micDevice);
      }

      if (camDevice) {
        await this.publishVideo(camDevice);
      }

      room.remoteParticipants.forEach((participant) => {
        this.remotes[participant.identity] = {
          participant: participant,
        };
        const metadata = participant.metadata
          ? (JSON.parse(participant.metadata) as any)
          : undefined;

        this.context!.remotes[participant.identity] = {
          camera: {
            muted: undefined,
            enabled: undefined,
          },
          microphone: {
            muted: undefined,
            enabled: undefined,
          },
          metadata: metadata,
        };

        this.emit("remote_join", {
          metadata: metadata!,
        });

        this.addRemoteEventHandler(this.remotes[participant.identity]);
      });

      room.addListener(RoomEvent.ParticipantConnected, (participant) => {
        this.remotes[participant.identity] = {
          participant: participant,
        };
        const metadata = participant.metadata
          ? (JSON.parse(participant.metadata) as any)
          : undefined;

        this.context!.remotes[participant.identity] = {
          camera: {
            muted: undefined,
            enabled: undefined,
          },
          microphone: {
            muted: undefined,
            enabled: undefined,
          },
          metadata: metadata,
        };

        this.emit("remote_join", {
          metadata: metadata!,
        });

        this.addRemoteEventHandler(this.remotes[participant.identity]);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        this.emit("remote_leave", {
          identity: participant.identity,
        });
        this.remotes[participant.identity].participant.removeAllListeners();
        delete this.remotes[participant.identity];

        delete this.context!.remotes[participant.identity];
      });

      this.emit("status", "LOADED");
      // this.context!.setStatus("LOADED");
    });

    room.addListener(RoomEvent.Disconnected, (reason) => {
      this.context!.local = {
        camera: {
          muted: false,
          enabled: false,
        },
        microphone: {
          muted: false,
          enabled: false,
        },
        metadata: {},
      };
      this.context!.remotes = {};
      this.local = undefined;

      this.remotes = {};

      room.removeAllListeners();
      // this.context!.setStatus("DISCONNECTED");
      this.emit("status", "DISCONNECTED");
    });

    await room.connect(url, token, { autoSubscribe: true });
  }
  async publishData<
    T extends keyof ViewContexts,
    V extends ViewContexts[T],
    K extends GetFunctionKeys<V>,
    P extends GetFunctionParams<V>[K]
  >(target: T, name: K, payload: P, destinationIdentities?: string[]) {
    try {
      const encoder = new TextEncoder();
      await this.room?.localParticipant.publishData(
        encoder.encode(JSON.stringify({ target, action: { name, payload } })),
        {
          reliable: true,
          destinationIdentities: destinationIdentities,
        }
      );
    } catch (error) {
      // console.log(error);
    }
  }
}
