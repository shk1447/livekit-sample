export const GetMediaDevices = async () => {
  // 스트림이 성공적으로 수신된 경우
  console.log("권한이 허용되었습니다.");

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (d) => d.deviceId
  );

  const result: {
    videoinput: MediaDeviceInfo[];
    audioinput: MediaDeviceInfo[];
    audiooutput: MediaDeviceInfo[];
  } = {
    videoinput: [],
    audioinput: [],
    audiooutput: [],
  };

  for (const device of devices) {
    switch (device.kind) {
      case "audioinput":
        result.audioinput.push(device);
        break;
      case "audiooutput":
        result.audiooutput.push(device);
        break;
      case "videoinput":
        result.videoinput.push(device);
        break;
    }
  }

  return result;
};
