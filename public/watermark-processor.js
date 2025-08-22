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
                this.watermarkImage = e.data.image;
            }
        });
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

    /**
     * @param {VideoFrame} input 
     * @param {OffscreenCanvas} output 
     */
    async processFrame(input, output) {
        if (!this.context) return;
        this.context.drawImage(input, 0, 0, output.width, output.height);
        if (this.watermarkImage) {
            this.context.globalAlpha = 1.0; // Full opacity for business card
            this.context.imageSmoothingEnabled = true;

            // Calculate card dimensions maintaining aspect ratio
            const originalCardWidth = this.watermarkImage.width;
            const originalCardHeight = this.watermarkImage.height;

            // Scale the card to fit the output width while maintaining aspect ratio
            const scale = output.width / originalCardWidth;
            const cardWidth = output.width;
            const cardHeight = originalCardHeight * scale;

            // Position the business card as a full-width bottom bar
            const cardX = 0;
            const cardY = output.height - cardHeight;

            // Draw the business card at the calculated position
            this.context.drawImage(this.watermarkImage, cardX, cardY, cardWidth, cardHeight);
            this.context.globalAlpha = 1.0;
        }
        return true;
    }
}

/** @import { registerProcessor } from '@zoom/videosdk' */
registerProcessor('watermark-processor', WatermarkProcessor);
