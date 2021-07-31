import { Injectable } from '@angular/core';
import { MouseButton, ToolSelector } from '@app/classes/constant';
import { Tracer } from '@app/classes/tracer';
import { PencilCommand } from '@app/classes/undoredoCommands/pencil-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tracer {
    private pathData: Vec2[];
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Pensil, 'mode_edit', false, 'Crayon', 'c');
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && !this.disableDraw) {
            this.drawingService.enableTrait();

            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown && !this.disableDraw) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.undoRedoService.addCommand(new PencilCommand(this.drawingService, this.pathData, this.thickness, this.drawingService.primaryColor));
            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && !this.disableDraw) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }
    onMouseLeave(event: MouseEvent): void {
        this.drawLine(this.drawingService.baseCtx, this.pathData);
        this.disableDraw = true;
        this.clearPath();
    }
    onMouseOver(event: MouseEvent): void {
        this.clearPath();

        this.disableDraw = false;
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = this.thickness;
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
