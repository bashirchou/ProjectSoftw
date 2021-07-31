import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyHandlerService } from './key-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    private squareDimensionPixelInternal: number = 30;
    private gridOpacity: number = 50;
    private gridDraw: boolean = false;
    private convertToPourcentageRatio: number = 100;
    private lineWidth: number = 1;

    private keyboardIncrement: number = 5;
    minSquareDimensionPixel: number = 3;
    maxSquareDimensionPixel: number = 75;
    minOpacity: number = 2;
    maxOpacity: number = 100;
    constructor(private drawingService: DrawingService, private keyHandlerService: KeyHandlerService) {
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('g').subscribe((shortcut: string) => {
            this.isGridDraw = !this.gridDraw;
        });
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('+').subscribe((shortcut: string) => this.shortcutAdd());
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('=').subscribe((shortcut: string) => this.shortcutAdd());
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('-').subscribe((shortcut: string) => this.shortcutRemove());
    }

    shortcutRemove(): void {
        let newSize = this.squareDimensionPixel;
        newSize -= this.keyboardIncrement;
        if (newSize < this.minSquareDimensionPixel) this.squareDimensionPixel = this.minSquareDimensionPixel;
        else this.squareDimensionPixel = newSize;
    }

    shortcutAdd(): void {
        let newSize = this.squareDimensionPixel;
        newSize += this.keyboardIncrement;
        if (newSize > this.maxSquareDimensionPixel) this.squareDimensionPixel = this.maxSquareDimensionPixel;
        else this.squareDimensionPixel = newSize;
    }
    drawGrid(): void {
        if (this.gridDraw) {
            this.drawingService.resizePreviewCtx.beginPath();
            this.drawingService.resizePreviewCtx.setLineDash([]);
            for (let x = 0; x <= this.drawingService.canvas.width; x += this.squareDimensionPixelInternal) {
                this.drawingService.resizePreviewCtx.moveTo(x, 0);
                this.drawingService.resizePreviewCtx.lineTo(x, this.drawingService.canvas.height);
            }
            // set the color of the line
            this.drawingService.resizePreviewCtx.strokeStyle = 'rgba(0,0,0,' + this.gridOpacity / this.convertToPourcentageRatio + ')';
            this.drawingService.resizePreviewCtx.lineWidth = this.lineWidth;
            // the stroke will actually paint the current path
            this.drawingService.resizePreviewCtx.stroke();
            // for the sake of the example 2nd path
            this.drawingService.resizePreviewCtx.beginPath();
            for (let y = 0; y <= this.drawingService.canvas.height; y += this.squareDimensionPixelInternal) {
                this.drawingService.resizePreviewCtx.moveTo(0, y);
                this.drawingService.resizePreviewCtx.lineTo(this.drawingService.canvas.width, y);
            }
            // set the color of the line
            this.drawingService.resizePreviewCtx.strokeStyle = 'rgba(0,0,0,' + this.gridOpacity / this.convertToPourcentageRatio + ')';
            // just for fun
            this.drawingService.resizePreviewCtx.lineWidth = this.lineWidth;
            // for your original question - you need to stroke only once
            this.drawingService.resizePreviewCtx.stroke();
        }
    }

    reset(): void {
        this.drawingService.resizePreviewCtx.clearRect(
            0,
            0,
            this.drawingService.resizePreviewCtx.canvas.width,
            this.drawingService.resizePreviewCtx.canvas.height,
        );
        this.drawGrid();
        this.drawingService.drawControlPoints();
    }
    set isGridDraw(isDrawing: boolean) {
        this.gridDraw = isDrawing;
        this.reset();
    }
    get isGridDraw(): boolean {
        return this.gridDraw;
    }

    set squareOpacity(newSquareOpacity: number) {
        this.gridOpacity = newSquareOpacity;
        this.reset();
    }
    get squareOpacity(): number {
        return this.gridOpacity;
    }

    set squareDimensionPixel(newDim: number) {
        this.squareDimensionPixelInternal = newDim;
        this.reset();
    }

    get squareDimensionPixel(): number {
        return this.squareDimensionPixelInternal;
    }
}
