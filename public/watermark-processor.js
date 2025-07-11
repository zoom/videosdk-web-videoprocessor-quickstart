/** @import { VideoProcessor } from '@zoom/videosdk' */
class WatermarkProcessor extends VideoProcessor {
    /** @type {OffscreenCanvasRenderingContext2D} */
    context = null;
    /** @type {ImageBitmap} */
    watermarkImage = null;

    /** @param {MessagePort} port */
    constructor(port, options) {
        super(port, options);
        port.addEventListener('message', (e) => {
            if (e.data.cmd === 'update_watermark_image') {
                this.updateWatermarkImage(e.data.data);
            }
        });
    }

    /**
     * @param {VideoFrame} input 
     * @param {OffscreenCanvas} output 
     */
    async processFrame(input, output) {
        this.renderFrame(input, output);
        return true;
    }

    onInit() {
        const canvas = this.getOutput();
        if (canvas) {
            this.context = canvas.getContext('2d');
            if (!this.context) {
                console.error('2D context could not be initialized.');
                return;
            }
        }
    }

    onUninit() {
        this.context = null;
        this.watermarkImage = null;
    }

    /** @param {ImageBitmap} input */
    updateWatermarkImage(imageBitmap) {
        this.watermarkImage = imageBitmap;
    }

    /**
     * @param {VideoFrame} input
     * @param {OffscreenCanvas} output
     */
    renderFrame(input, output) {
        if (!this.context) return;
        this.context.drawImage(input, 0, 0, output.width, output.height);
        if (this.watermarkImage) {
            this.context.globalAlpha = 0.5;
            this.context.imageSmoothingEnabled = true;
            this.context.drawImage(
                this.watermarkImage,
                0,
                0,
                this.watermarkImage.width,
                this.watermarkImage.height
            );
            this.context.globalAlpha = 1.0;
        }
    }
}

/** @import { registerProcessor } from '@zoom/videosdk' */
registerProcessor('watermark-processor', WatermarkProcessor);
