import { useCallback, useEffect, useRef } from "react";

export type AudioTrackProps = {
  mediaStream?: MediaStream;
  audioContext?: AudioContext;
  sinkId?: string;
};

export const AudioTrackRenderer = ({
  mediaStream,
  audioContext,
  sinkId,
}: AudioTrackProps) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);

  const cleanupWebAudio = useCallback(() => {
    if (sourceNode.current) {
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }

    if (ref.current) {
      ref.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      cleanupWebAudio();

      if (!mediaStream || !ref.current || !audioContext) {
        return;
      }

      try {
        // Web Audio 처리 (선택적: 실제로 효과 적용이 없으면 제거 가능)
        sourceNode.current = audioContext.createMediaStreamSource(mediaStream);
        sourceNode.current.connect(audioContext.destination);

        // HTMLMediaElement에 스트림 할당
        ref.current.srcObject = mediaStream;

        // console.log(sinkId);

        if (!mediaStream || !ref.current || !audioContext) {
          return;
        }
        // // setSinkId 먼저 적용
        if ("setSinkId" in audioContext && sinkId) {
          try {
            await (audioContext as any).setSinkId(sinkId);
          } catch (error) {
            console.warn("setSinkId failed:", error);
          }
        }

        // AudioContext 깨우기
        try {
          await audioContext.resume();
        } catch (err) {
          console.warn("audioContext.resume failed:", err);
        }

        // 오디오 재생
        try {
          await ref.current.play();
        } catch (err) {
          console.warn("audio.play() failed:", err);
        }
      } catch (err) {
        console.error("setupAudio error:", err);
      }
    };

    setupAudio();

    return () => {
      cleanupWebAudio();
    };
  }, [ref, ref.current, mediaStream, audioContext, sinkId, cleanupWebAudio]);

  return <audio muted ref={ref} />;
};
