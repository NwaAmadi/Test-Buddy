const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;
const accessToken = localStorage.getItem("accessToken") || "";

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export const startFaceMonitoring = (
  videoEl: HTMLVideoElement,
  student_id: string,
  exam_id: string,
  onViolation: (reason: string) => void
) => {
  let ended = false;
  let lastFaceTime = Date.now();

  const end = (reason: string) => {
    if (ended) return;
    ended = true;
    sendScreenshot(videoEl, reason);
    onViolation(reason);
  };

  const sendScreenshot = (video: HTMLVideoElement, reason: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.6);

    fetch(`${BACKEND_URL}/api/monitoring/report-violation`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        student_id,
        exam_id,
        reason,
        image: imageData,
        timestamp: new Date().toISOString(),
      }),
    });
  };

  const faceMesh = new window.FaceMesh({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 2,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults((results: any) => {
    if (ended) return;

    const faceCount = results.multiFaceLandmarks?.length || 0;

    if (faceCount === 0) {
      if (Date.now() - lastFaceTime > 3000) {
        end("No face detected for 3 seconds");
      }
    } else if (faceCount === 1) {
      lastFaceTime = Date.now();
    } else {
      end("Multiple faces detected");
    }
  });

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoEl.srcObject = stream;
      const camera = new window.Camera(videoEl, {
        onFrame: async () => {
          await faceMesh.send({ image: videoEl });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    })
    .catch(() => {
      onViolation("Camera access denied");
    });
};
