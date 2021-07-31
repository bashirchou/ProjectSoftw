import { Injectable } from '@angular/core';
import { ANGLE_PI_OVER_FOUR, MouseButton, Polygontype, polygonTypeString, ShapeType, ToolSelector } from '@app/classes/constant';
import { Shape } from '@app/classes/shape';
import { PolygoneCommand } from '@app/classes/undoredoCommands/polygone-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

// tslint:disable:no-cyclomatic-complexityy
@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Shape {
    polygonType: Polygontype = Polygontype.Triangle;

    pathData: Vec2[];
    rectangleHeight: number;
    rectangleWidth: number;
    shift: number = Math.PI / 2;
    centerAngle: number = ANGLE_PI_OVER_FOUR;
    radius: number = 0;
    centerSquare: Vec2 = { x: 0, y: 0 };
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Polygone, 'change_history', false, 'Polygone', '3');
        this.clearPath();
    }

    polygoneToString(polygonType: Polygontype): string {
        const poly = polygonTypeString.get(polygonType);
        if (poly == undefined) throw new Error('Invalid polygonType');
        return poly;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.drawingService.enableTrait();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawPolygon(this.drawingService.previewCtx, this.pathData, this.drawingService.primaryColor, this.drawingService.secondaryColor);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawPolygon(this.drawingService.baseCtx, this.pathData, this.drawingService.primaryColor, this.drawingService.secondaryColor);
            this.undoRedoService.addCommand(
                new PolygoneCommand(
                    this.drawingService,
                    this.pathData,
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
                    this.rectangleHeight,
                    this.rectangleWidth,
                    this.shapeType,
                    this.polygonType,
                    this.shift,
                    this.radius,
                    this.centerAngle,
                    this.centerSquare,
                    this,
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
            this.drawCircle(this.drawingService.previewCtx, this.pathData);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);
            this.drawPolygon(this.drawingService.previewCtx, this.pathData, this.drawingService.primaryColor, this.drawingService.secondaryColor);
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
    drawControl(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (!this.disableDraw) {
            this.drawPolygon(this.drawingService.previewCtx, this.pathData, this.drawingService.primaryColor, this.drawingService.secondaryColor);
            this.drawCircle(this.drawingService.previewCtx, this.pathData);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);
        }
    }

    drawPolygon(ctx: CanvasRenderingContext2D, path: Vec2[], primaryColor: string, secondaryColor: string): void {
        if (!this.disableDraw) {
            this.radius = 0;
            const adjustement = 3;
            const numberSides = this.polygonType + adjustement; // Carre
            ctx.beginPath();

            ctx.setLineDash([0]);
            this.drawingService.enableFormesColor(this.shapeType, ctx, primaryColor, secondaryColor);
            const firstX = this.centerSquare.x + this.radius * Math.cos(this.centerAngle);
            const firstY = this.centerSquare.y + this.radius * Math.sin(this.centerAngle);

            if (Math.abs(this.rectangleWidth) <= Math.abs(this.rectangleHeight)) {
                this.radius = this.rectangleWidth / 2;
            } else if (Math.abs(this.rectangleWidth) > Math.abs(this.rectangleHeight)) {
                this.radius = this.rectangleHeight / 2;
            }
            ctx.stroke();
            ctx.beginPath();

            for (let i = 1; i <= numberSides; i++) {
                ctx.lineTo(
                    firstX + this.radius * Math.cos((i * 2 * Math.PI) / numberSides + this.shift),
                    firstY + this.radius * Math.sin((i * 2 * Math.PI) / numberSides + this.shift),
                );
            }
            ctx.lineTo(
                firstX + this.radius * Math.cos((1 * 2 * Math.PI) / numberSides + this.shift),
                firstY + this.radius * Math.sin((1 * 2 * Math.PI) / numberSides + this.shift),
            );
            if (this.shapeType !== ShapeType.Border) {
                ctx.fill();
            }
            ctx.stroke();
        }
    }
    private drawCircle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (!this.disableDraw) {
            const dotedPatern = 6;
            ctx.beginPath();
            ctx.setLineDash([dotedPatern]);
            ctx.arc(this.centerSquare.x, this.centerSquare.y, Math.abs(this.radius), 2 * Math.PI, 0);
            ctx.stroke();
        }
    }
    drawRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.rectangleWidth = path[path.length - 1].x - path[0].x;
        this.rectangleHeight = path[path.length - 1].y - path[0].y;
        const sign = (this.rectangleHeight * this.rectangleWidth) / Math.abs(this.rectangleHeight * this.rectangleWidth);
        if (Math.abs(this.rectangleHeight) >= Math.abs(this.rectangleWidth)) {
            this.shift = (-sign * ((this.rectangleHeight / Math.abs(this.rectangleHeight)) * Math.PI)) / 2;
            this.centerSquare.x = path[0].x + this.rectangleWidth / 2;
            this.centerSquare.y = path[0].y + sign * (this.rectangleWidth / 2);
        } else {
            this.shift = (-sign * ((this.rectangleWidth / Math.abs(this.rectangleWidth)) * Math.PI)) / 2;
            this.centerSquare.x = path[0].x + sign * (this.rectangleHeight / 2);
            this.centerSquare.y = path[0].y + this.rectangleHeight / 2;
        }

        ctx.rect(path[0].x, path[0].y, this.rectangleWidth, this.rectangleHeight);
        ctx.stroke();
        ctx.setLineDash([0]);
    }
    private clearPath(): void {
        this.pathData = [];
    }
}
