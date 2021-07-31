import { Injectable } from '@angular/core';
import { MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH, MouseButton, ShapeType, ToolSelector } from '@app/classes/constant';
import { Shape } from '@app/classes/shape';
import { RectangleCommand } from '@app/classes/undoredoCommands/rectangle-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Shape {
    pathData: Vec2[];
    private isDrawSquare: boolean;
    private width: number;
    private height: number;
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Rectangle, 'crop_landscape', false, 'rectangle', '1');
        this.clearPath();
    }
    onMouseDown(event: MouseEvent): void {
        this.clearPath();
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.chooseForm(this.drawingService.previewCtx, this.pathData);
        }
    }
    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.chooseForm(this.drawingService.baseCtx, this.pathData);
            this.undoRedoService.addCommand(
                new RectangleCommand(
                    this.drawingService,
                    this.pathData,
                    this.thickness,
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
                    this.height,
                    this.width,
                    this.shapeType,
                ),
            );
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.chooseForm(this.drawingService.previewCtx, this.pathData);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey) this.isDrawSquare = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown) {
            this.chooseForm(this.drawingService.previewCtx, this.pathData);
        }
    }
    onKeyDown(event: KeyboardEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (event.shiftKey) this.isDrawSquare = true;
        if (this.mouseDown) {
            this.chooseForm(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.disableDraw = true;
        this.clearPath();
    }
    onMouseOver(event: MouseEvent): void {
        this.disableDraw = false;
        this.clearPath();
    }

    private drawRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.rect(path[0].x, path[0].y, this.width, this.height);
    }
    private drawSquare(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (this.height >= this.width) {
            ctx.rect(path[0].x, path[0].y, this.width, (this.width * (this.height * this.width)) / Math.abs(this.height * this.width));
        } else {
            ctx.rect(path[0].x, path[0].y, (this.height * (this.height * this.width)) / Math.abs(this.height * this.width), this.height);
        }
    }

    chooseForm(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (!this.disableDraw) {
            this.drawingService.enableFormes(this.shapeType, ctx);
            ctx.lineWidth = this.thickness;
            ctx.beginPath();
            this.height = path[path.length - 1].y - path[0].y;
            this.width = path[path.length - 1].x - path[0].x;
            if (this.isDrawSquare) {
                this.drawSquare(ctx, path);
            } else {
                this.drawRectangle(ctx, path);
            }
            if (this.shapeType !== ShapeType.Border) {
                ctx.fill();
            }
        }
        ctx.stroke();
    }

    drawRectanglePointiller(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        const lineWidth = 5;
        const dotedPatern = 6;
        ctx.lineWidth = lineWidth;
        this.height = path[path.length - 1].y;
        this.width = path[path.length - 1].x;
        ctx.setLineDash([dotedPatern]);
        if (this.width <= MIN_CANVAS_WIDTH) {
            this.width = MIN_CANVAS_WIDTH;
        }
        if (this.height <= MIN_CANVAS_HEIGHT) {
            this.height = MIN_CANVAS_HEIGHT;
        }
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
