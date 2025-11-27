import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export class HandTracker {
  handLandmarker: HandLandmarker | undefined;
  runningMode: "IMAGE" | "VIDEO" = "VIDEO";
  webcamRunning: boolean = false;
  video: HTMLVideoElement | null = null;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;

  constructor() {}

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: this.runningMode,
      numHands: 2,
    });
  }

  start(video: HTMLVideoElement) {
    this.video = video;
    this.webcamRunning = true;
    this.predictWebcam();
  }

  stop() {
    this.webcamRunning = false;
  }

  async predictWebcam() {
    if (!this.handLandmarker || !this.webcamRunning || !this.video) return;

    let startTimeMs = performance.now();
    if (this.video.currentTime > 0) {
      const results = this.handLandmarker.detectForVideo(this.video, startTimeMs);
      // Dispatch event or callback with results
      if (results.landmarks) {
        const event = new CustomEvent("hand-results", { detail: results });
        window.dispatchEvent(event);
      }
    }

    if (this.webcamRunning) {
      window.requestAnimationFrame(() => this.predictWebcam());
    }
  }
}
