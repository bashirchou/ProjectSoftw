import { Injectable } from '@angular/core';
import { leftMouseClick, rightMouseClick, ToolSelector } from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    currentX: number = -1;
    currentY: number = -1;

    zoomCtx: CanvasRenderingContext2D;
    zoomCanvas: HTMLCanvasElement;

    private pixelCenterDiameter: number = 5;
    private zoom: number = 20;
    constructor(drawingService: DrawingService) {
        super(drawingService, ToolSelector.Pipette, 'colorize', false, 'Pipette', 'i');
    }

    onMouseLeave(event: MouseEvent): void {
        this.createEmptyCircleDrawZone();
    }
    onMouseMove(event: MouseEvent): void {
        this.currentX = event.offsetX;
        this.currentY = event.offsetY;

        if (!this.drawingService.mouseOnCanvas) {
            this.createEmptyCircleDrawZone();
        } else if (this.drawingService.mouseOnCanvas) {
            this.calculateZoomedPixel();
        }
    }

    createEmptyCircleDrawZone(): void {
        this.zoomCtx.strokeStyle = 'black';
        this.zoomCtx.beginPath();
        this.zoomCtx.arc(this.zoomCanvas.width / 2, this.zoomCanvas.height / 2, this.zoomCanvas.height / 2, 0, 2 * Math.PI, false);
        this.zoomCtx.stroke();
        this.zoomCtx.clip();
        this.zoomCtx.fillStyle = '#ffffff';
        this.zoomCtx.fillRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
    }

    createCercleForMiddlePixel(): void {
        this.zoomCtx.beginPath();
        this.zoomCtx.arc(this.zoomCanvas.width / 2, this.zoomCanvas.height / 2, this.pixelCenterDiameter, 0, 2 * Math.PI, false);
        this.zoomCtx.stroke();
    }

    drawZoomedImage(): void {
        const sx = this.currentX - this.zoomCanvas.width / 2;
        const sy = this.currentY - this.zoomCanvas.height / 2;
        this.zoomCtx.setTransform(this.zoom, 0, 0, this.zoom, this.zoomCanvas.width / 2, this.zoomCanvas.height / 2);
        this.zoomCtx.drawImage(
            this.drawingService.canvas,
            sx,
            sy,
            this.zoomCanvas.width,
            this.zoomCanvas.height,
            -this.zoomCanvas.width / 2,
            -this.zoomCanvas.height / 2,
            this.zoomCanvas.width,
            this.zoomCanvas.height,
        );

        // reset to identity matrix
        this.zoomCtx.setTransform(1, 0, 0, 1, 0, 0);
    }

    calculateZoomedPixel(): void {
        this.zoomCtx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
        this.createEmptyCircleDrawZone();
        this.drawZoomedImage();
        this.createCercleForMiddlePixel();
    }

    onMouseOver(event: MouseEvent): void {
        this.disableDraw = false;
    }

    onMouseDown(event: MouseEvent): void {
        if (this.drawingService.mouseOnCanvas) {
            event.preventDefault();
            switch (event.button) {
                case leftMouseClick:
                    this.drawingService.primaryColor = this.drawingService.getPixelColor(this.currentX, this.currentY);
                    break;
                case rightMouseClick:
                    this.drawingService.secondaryColor = this.drawingService.getPixelColor(this.currentX, this.currentY);
                    break;
                default:
            }
        }
    }
}
