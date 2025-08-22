import ZoomVideo, { type event_peer_video_state_change, Processor, VideoPlayer, VideoQuality, VideoClient } from "@zoom/videosdk";
import { generateSignature, getBusinessCardBitmap } from "./utils";
import "./style.css";

// You should sign your JWT with a backend service in a production use-case
const sdkKey = import.meta.env.VITE_SDK_KEY as string;
const sdkSecret = import.meta.env.VITE_SDK_SECRET as string;

const topic = "TestOne";
const role = 1;
const username = `User-${String(new Date().getTime()).slice(6)}`;
const videoContainer = document.querySelector('video-player-container') as HTMLElement;
let processor: Processor;
let client: typeof VideoClient;

const startCall = async () => {
    client = ZoomVideo.createClient();
    await client.init("en-US", "Global", { patchJsMedia: true });
    const token = generateSignature(topic, role, sdkKey, sdkSecret);
    client.on("peer-video-state-change", renderVideo);
    await client.join(topic, token, username);
    const mediaStream = client.getMediaStream();
    await mediaStream.startAudio();
    await mediaStream.startVideo();
    processor = await mediaStream.createProcessor({
        type: "video",
        name: "watermark-processor",
        url: window.location.origin + "/watermark-processor.js",
    });
    await mediaStream.addProcessor(processor); // Add a processor
    await renderVideo({ action: 'Start', userId: client.getCurrentUserInfo().userId });
    await applyWatermark();
};

const renderVideo: typeof event_peer_video_state_change = async (event) => {
    const mediaStream = client.getMediaStream();
    if (event.action === 'Stop') {
        const element = await mediaStream.detachVideo(event.userId);
        Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    } else {
        const userVideo = await mediaStream.attachVideo(event.userId, VideoQuality.Video_360P);
        videoContainer.appendChild(userVideo as VideoPlayer);
    }
};

const applyWatermark = async () => {
    const bitmap = await getBusinessCardBitmap({
        name: username,
        title: "Video SDK Demo",
        company: "Acme Co.",
        email: "user@example.com",
        frameWidth: 1280,
        frameHeight: 720,
        cardWidth: 1280,
        cardHeight: 280,
        brandColor: "#22c55e",
    });
    processor.port.postMessage({ cmd: "update_watermark_image", image: bitmap });
}

const leaveCall = async () => {
    const mediaStream = client.getMediaStream();
    mediaStream.removeProcessor(processor);
    for (const user of client.getAllUser()) {
        const element = await mediaStream.detachVideo(user.userId);
        Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    }
    client.off("peer-video-state-change", renderVideo);
    await client.leave();
    await ZoomVideo.destroyClient();
}

const toggleVideo = async () => {
    const mediaStream = client.getMediaStream();
    if (mediaStream.isCapturingVideo()) {
        await mediaStream.stopVideo();
        await renderVideo({ action: 'Stop', userId: client.getCurrentUserInfo().userId });
    } else {
        await mediaStream.startVideo();
        await renderVideo({ action: 'Start', userId: client.getCurrentUserInfo().userId });
        await applyWatermark();
    }
};

// UI Logic
const startBtn = document.querySelector("#start-btn") as HTMLButtonElement;
const stopBtn = document.querySelector("#stop-btn") as HTMLButtonElement;
const toggleVideoBtn = document.querySelector("#toggle-video-btn") as HTMLButtonElement;
const changeWatermarkBtn = document.querySelector("#change-watermark-btn") as HTMLButtonElement;

startBtn.addEventListener("click", async () => {
    if (!sdkKey || !sdkSecret) {
        alert("Please enter SDK Key and SDK Secret in the .env file");
        return;
    }
    startBtn.innerHTML = "Connecting...";
    startBtn.disabled = true;
    await startCall();
    startBtn.innerHTML = "Connected";
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
    toggleVideoBtn.style.display = "block";
    changeWatermarkBtn.style.display = "block";
});

stopBtn.addEventListener("click", async () => {
    toggleVideoBtn.style.display = "none";
    await leaveCall();
    stopBtn.style.display = "none";
    startBtn.style.display = "block";
    startBtn.innerHTML = "Join";
    startBtn.disabled = false;
    changeWatermarkBtn.style.display = "none";
});

toggleVideoBtn.addEventListener("click", async () => {
    await toggleVideo();
});