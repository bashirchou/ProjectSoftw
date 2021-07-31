import { Injectable } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, maxColorValue, MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH, pixelLenght, ShapeType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    previewCtxText: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    currentCanvas: ImageData;
    currentPreviewCanvas: ImageData;
    primaryColor: string = 'rgba(0,0,0,1)';
    secondaryColor: string = 'rgba(0,0,0,1)';
    canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    resizePreviewCtx: CanvasRenderingContext2D;
    mouseOnCanvas: boolean = false;
    mouseOnWorkingZone: boolean = false;
    controlPointDiameter: number = 15;
    private marginX: number = 3;
    private marginY: number = 3;
    private image: HTMLImageElement;

    drawPoint(x: number, y: number): void {
        this.resizePreviewCtx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.resizePreviewCtx.strokeStyle = 'rgba(0,0,0,1)';
        this.resizePreviewCtx.beginPath();
        this.resizePreviewCtx.lineCap = 'round';
        this.resizePreviewCtx.lineWidth = this.controlPointDiameter;
        this.resizePreviewCtx.moveTo(x, y);
        this.resizePreviewCtx.lineTo(x, y);
        this.resizePreviewCtx.stroke();
    }

    drawControlPoints(): void {
        this.drawPoint(this.baseCtx.canvas.width + this.marginX, this.baseCtx.canvas.height + this.marginY);
        this.drawPoint(this.baseCtx.canvas.width / 2, this.baseCtx.canvas.height + this.marginY);
        this.drawPoint(this.baseCtx.canvas.width + this.marginX, this.baseCtx.canvas.height / 2);
    }
    changeColor(colorPrimaire: string, colorSecondaire: string): void {
        this.baseCtx.fillStyle = colorPrimaire;
        this.previewCtx.fillStyle = colorPrimaire;
        this.baseCtx.strokeStyle = colorSecondaire;
        this.previewCtx.strokeStyle = colorSecondaire;

        this.primaryColor = colorPrimaire;
        this.secondaryColor = colorSecondaire;
    }

    enableTrait(): void {
        this.baseCtx.strokeStyle = this.primaryColor;
        this.previewCtx.strokeStyle = this.primaryColor;
    }

    enableSelect(): void {
        this.baseCtx.fillStyle = this.secondaryColor;
        this.previewCtx.fillStyle = this.secondaryColor;
        this.baseCtx.strokeStyle = 'black';
        this.previewCtx.strokeStyle = 'black';
    }
    enableFormes(shape: ShapeType, ctx: CanvasRenderingContext2D): void {
        this.enableFormesColor(shape, ctx, this.primaryColor, this.secondaryColor);
    }

    enableFormesColor(shape: ShapeType, ctx: CanvasRenderingContext2D, primaryColor: string, secondaryColor: string): void {
        switch (shape) {
            case ShapeType.Border:
                ctx.strokeStyle = secondaryColor;
                break;
            case ShapeType.Border_full:
                ctx.strokeStyle = secondaryColor;
                ctx.fillStyle = primaryColor;
                break;
            case ShapeType.Full:
                ctx.strokeStyle = primaryColor;
                ctx.fillStyle = primaryColor;
                break;
        }
    }

    changefillStyle(color: string): void {
        this.secondaryColor = color;
    }

    matrixToArrayIndex(i: number, j: number, width: number): number {
        return i * (pixelLenght * width) + j;
    }
    resize(width: number, height: number): void {
        if (height < MIN_CANVAS_HEIGHT) {
            height = MIN_CANVAS_HEIGHT;
        }
        if (width < MIN_CANVAS_WIDTH) {
            width = MIN_CANVAS_WIDTH;
        }
        const oldImageData: ImageData = this.baseCtx.getImageData(0, 0, this.baseCtx.canvas.width, this.baseCtx.canvas.height);
        const newImageData: ImageData = this.baseCtx.createImageData(width, height);

        for (let i = 0; i < newImageData.height; i += 1) {
            for (let j = 0; j < newImageData.width * pixelLenght; j += 1) {
                if (i > this.baseCtx.canvas.height || j / pixelLenght > this.baseCtx.canvas.width) {
                    newImageData.data[this.matrixToArrayIndex(i, j, width)] = maxColorValue;
                } else {
                    newImageData.data[this.matrixToArrayIndex(i, j, width)] =
                        oldImageData.data[this.matrixToArrayIndex(i, j, this.baseCtx.canvas.width)];
                }
            }
        }

        this.baseCtx.canvas.width = width;
        this.previewCtx.canvas.width = width;
        this.baseCtx.canvas.height = height;
        this.previewCtx.canvas.height = height;
        this.baseCtx.putImageData(newImageData, 0, 0);
    }

    drawCanvasWithVec2(path: Vec2[], strokewidth?: number, color?: string): void {
        this.baseCtx.beginPath();
        this.baseCtx.lineWidth = strokewidth ? strokewidth : 1;
        this.baseCtx.strokeStyle = color ? color : 'white';
        for (let i = 0; i < path.length - 1; ++i) {
            this.baseCtx.moveTo(path[i].x, path[i].y);
            this.baseCtx.lineTo(path[i + 1].x, path[i + 1].y);
        }
        this.baseCtx.stroke();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    saveCanvas(): void {
        this.currentCanvas = this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    restoreCanvas(): void {
        this.baseCtx.putImageData(this.currentCanvas, 0, 0);
    }
    savePreviewCanvas(): void {
        this.currentPreviewCanvas = this.previewCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    restorePreviewCanvas(): void {
        this.previewCtx.putImageData(this.currentPreviewCanvas, 0, 0);
    }

    convertCanvasToBase64(): string {
        return this.canvas.toDataURL('image/png', 1.0);
    }
    // https://stackoverflow.com/questions/4409445/base64-png-data-to-html5-canvas
    convertBase64ToCanvas(base64: string): void {
        this.image = new Image();
        this.image.src = base64;
        this.image.onload = () => {
            this.baseCtx.drawImage(this.image, 0, 0);
        };
    }

    // https://ourcodeworld.com/articles/read/185/how-to-get-the-pixel-color-from-a-canvas-on-click-or-mouse-event-with-javascript
    rgbToHex(r: number, g: number, b: number): string {
        // tslint:disable-next-line: no-magic-numbers
        if (r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0) throw new RangeError('Invalid color component');
        // tslint:disable-next-line: no-bitwise
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    // https://ourcodeworld.com/articles/read/185/how-to-get-the-pixel-color-from-a-canvas-on-click-or-mouse-event-with-javascript
    getPixelColor(x: number, y: number): string {
        const p = this.baseCtx.getImageData(x, y, 1, 1).data;
        // tslint:disable-next-line: no-magic-numbers
        return '#' + ('000000' + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
    }

    isPointsOnCanvas(x: number, y: number): boolean {
        return x <= this.canvas.width && x >= 0 && y <= this.canvas.height && y >= 0;
    }

    get width(): number {
        return this.canvas.width;
    }

    get height(): number {
        return this.canvas.height;
    }

    isCanvasEmpty(): boolean {
        const image = this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < image.data.length; i += pixelLenght) {
            for (let rgba = 0; rgba < pixelLenght; rgba++) {
                if (image.data[i + rgba] !== maxColorValue) return false;
            }
        }
        return true;
    }
}
