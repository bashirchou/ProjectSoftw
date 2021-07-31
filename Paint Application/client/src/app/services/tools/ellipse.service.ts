import { Injectable } from '@angular/core';
import { MouseButton, ShapeType, ToolSelector } from '@app/classes/constant';
import { Shape } from '@app/classes/shape';
import { EllipseCommand } from '@app/classes/undoredoCommands/ellipse-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Shape {
    private pathData: Vec2[];

    private drawCircle: boolean;
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Ellipse, 'panorama_fish_eye', false, 'ellipse', '2');
        this.clearPath();
    }
    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawEllipse(this.drawingService.baseCtx, this.pathData, this.thickness);
            this.undoRedoService.addCommand(
                new EllipseCommand(
                    this.drawingService,
                    this.pathData,
                    this.thickness,
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
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
            this.drawEllipse(this.drawingService.previewCtx, this.pathData, this.thickness);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData, this.thickness);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey) this.drawCircle = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown) {
            this.drawEllipse(this.drawingService.previewCtx, this.pathData, this.thickness);
        }
    }
    onKeyDown(event: KeyboardEvent): void {
        if (event.shiftKey) this.drawCircle = true;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown) {
            this.drawEllipse(this.drawingService.previewCtx, this.pathData, this.thickness);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.disableDraw = true;
    }
    onMouseOver(event: MouseEvent): void {
        this.disableDraw = false;
    }

    drawEllipse(ctx: CanvasRenderingContext2D, path: Vec2[], lineWidth: number): void {
        this.drawingService.enableFormes(this.shapeType, ctx);
        if (!this.disableDraw) {
            ctx.beginPath();
            ctx.lineWidth = lineWidth;

            const radiusY = path[path.length - 1].y - path[0].y;
            const radiusX = path[path.length - 1].x - path[0].x;

            if (this.drawCircle) {
                radiusX >= 0 ? ctx.arc(path[0].x, path[0].y, radiusX, 2 * Math.PI, 0) : ctx.arc(path[0].x, path[0].y, -radiusX, 2 * Math.PI, 0);
            } else {
                if (radiusX >= 0) {
                    radiusY >= 0
                        ? ctx.ellipse(path[0].x, path[0].y, radiusX, radiusY, Math.PI, 0, 2 * Math.PI)
                        : ctx.ellipse(path[0].x, path[0].y, radiusX, -radiusY, Math.PI, 0, 2 * Math.PI);
                } else {
                    radiusY >= 0
                        ? ctx.ellipse(path[0].x, path[0].y, -radiusX, radiusY, Math.PI, 0, 2 * Math.PI)
                        : ctx.ellipse(path[0].x, path[0].y, -radiusX, -radiusY, Math.PI, 0, 2 * Math.PI);
                }
            }
            if (this.shapeType !== ShapeType.Border) {
                ctx.fill();
            }

            ctx.stroke();
        }
    }

    private drawRectangle(ctx: CanvasRenderingContext2D, path: Vec2[], lineLength: number): void {
        if (!this.disableDraw) {
            this.drawingService.enableFormes(this.shapeType, ctx);
            ctx.beginPath();
            const lineLengthRectangle = 2;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = lineLengthRectangle;

            const radiusY = path[path.length - 1].y - path[0].y;
            const radiusX = path[path.length - 1].x - path[0].x;

            if (this.drawCircle) {
                this.drawSquare(ctx, path, lineLength);
            } else {
                if (radiusX >= 0) {
                    if (radiusY >= 0) {
                        ctx.strokeRect(
                            path[0].x - radiusX - lineLength / 2,
                            path[0].y - radiusY - lineLength / 2,
                            2 * radiusX + lineLength,
                            2 * radiusY + lineLength,
                        );
                    } else {
                        ctx.strokeRect(
                            path[0].x - radiusX - lineLength / 2,
                            path[0].y - radiusY + lineLength / 2,
                            2 * radiusX + lineLength,
                            2 * radiusY - lineLength,
                        );
                    }
                } else {
                    if (radiusY >= 0) {
                        ctx.strokeRect(
                            path[0].x - radiusX + lineLength / 2,
                            path[0].y - radiusY - lineLength / 2,
                            2 * radiusX - lineLength,
                            2 * radiusY + lineLength,
                        );
                    } else {
                        ctx.strokeRect(
                            path[0].x - radiusX + lineLength / 2,
                            path[0].y - radiusY + lineLength / 2,
                            2 * radiusX - lineLength,
                            2 * radiusY - lineLength,
                        );
                    }
                }
            }
            ctx.stroke();
        }
    }
    drawSquare(ctx: CanvasRenderingContext2D, path: Vec2[], lineLength: number): void {
        const radiusX = path[path.length - 1].x - path[0].x;
        if (radiusX >= 0) {
            ctx.strokeRect(
                path[0].x - radiusX - lineLength / 2,
                path[0].y - radiusX - lineLength / 2,
                2 * radiusX + lineLength,
                2 * radiusX + lineLength,
            );
        } else {
            ctx.strokeRect(
                path[0].x - radiusX + lineLength / 2,
                path[0].y - radiusX + lineLength / 2,
                2 * radiusX - lineLength,
                2 * radiusX - lineLength,
            );
        }
    }
    private clearPath(): void {
        this.pathData = [];
    }
}
