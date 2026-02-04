import ZoomVideo, { type event_peer_video_state_change, Processor, VideoPlayer, VideoQuality, VideoClient } from "@zoom/videosdk";
import { getBitmap } from "./utils";
import "./style.css";

const sessionName = "TestOne";
const username = `User-${String(new Date().getTime()).slice(6)}`;
const videoContainer = document.querySelector('video-player-container') as HTMLElement;
let processor: Processor;
let client: typeof VideoClient;

const startCall = async (token: string) => {
    client = ZoomVideo.createClient();
    await client.init("en-US", "Global", { patchJsMedia: true });
    client.on("peer-video-state-change", renderVideo);
    await client.join(sessionName, token, username);
    const mediaStream = client.getMediaStream();
    if (!mediaStream.isSupportVideoProcessor()) {
        alert("Your browser does not support video processor");
    }
    await mediaStream.startAudio();
    await mediaStream.startVideo();
    processor = await mediaStream.createProcessor({
        type: "video",
        name: "watermark-processor",
        url: window.location.origin + "/watermark-processor.js",
    });
    await mediaStream.addProcessor(processor); // Add a processor
    await renderVideo({ action: 'Start', userId: client.getCurrentUserInfo().userId });
    await applyWatermark("Hello world!");
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

const applyWatermark = async (text: string) => {
    const imageBitmap = await getBitmap(text); // create a bitmap image from text
    processor.port.postMessage({ cmd: "update_watermark_image", image: imageBitmap });
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
    }
};

// UI Logic
const startBtn = document.querySelector("#start-btn") as HTMLButtonElement;
const stopBtn = document.querySelector("#stop-btn") as HTMLButtonElement;
const toggleVideoBtn = document.querySelector("#toggle-video-btn") as HTMLButtonElement;
const changeWatermarkBtn = document.querySelector("#change-watermark-btn") as HTMLButtonElement;

startBtn.addEventListener("click", async () => {
    const token = window.prompt("Enter a token");
    if (!token) {
        alert("Please enter a token");
        return;
    }
    startBtn.innerHTML = "Connecting...";
    startBtn.disabled = true;
    await startCall(token);
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

changeWatermarkBtn.addEventListener("click", async () => {
    await applyWatermark(Math.random().toString(36).substring(2, 15));
});