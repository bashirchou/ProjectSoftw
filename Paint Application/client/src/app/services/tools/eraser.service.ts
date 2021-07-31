import { Injectable } from '@angular/core';
import { MouseButton, ToolSelector } from '@app/classes/constant';
import { Tracer } from '@app/classes/tracer';
import { EraserCommand } from '@app/classes/undoredoCommands/eraser-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

const DEFAULT_THICKNESS = 5;
@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tracer {
    private pathData: Vec2[];
    private mouseOver: boolean;
    cursor: string = "url('assets/eraser_cursor.svg) 10 10,progress";

    constructor(public drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Eraser, 'eraserIcon', true, 'eraser', 'e');
        this.thickness = DEFAULT_THICKNESS;
        this.clearPath();
    }

    isPointOnCanvas(x: number, y: number): boolean {
        return x <= this.drawingService.canvas.width && x >= 0 && y <= this.drawingService.canvas.height && y >= 0;
    }
    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.drawingService.enableTrait();
            this.clearPath();
            this.drawingService.previewCtx.strokeStyle = 'white';
            this.drawingService.baseCtx.strokeStyle = 'white';
            this.mouseDownCoord = this.getPositionFromMouse(event);

            if (this.mouseOver && this.drawingService.mouseOnCanvas) {
                this.pathData.push({ x: this.mouseDownCoord.x + 1, y: this.mouseDownCoord.y + 1 });
            }
            this.eraseLine(this.drawingService.previewCtx, this.pathData);
        }
    }
    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.drawingService.enableTrait();
            this.pathData.push(mousePosition);
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.undoRedoService.addCommand(new EraserCommand(this.drawingService, this.pathData, this.thickness, this.drawingService.primaryColor));
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseOver(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.mouseOver = true;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.drawingService.enableTrait();
            this.mouseOver = true;
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.eraseLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    eraseLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();

        for (const point of path) {
            ctx.lineWidth = this.thickness;

            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = 'white';
        }
        ctx.stroke();
    }

    clearPath(): void {
        this.pathData = [];
    }
}
