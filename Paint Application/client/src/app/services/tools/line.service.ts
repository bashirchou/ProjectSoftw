import { Injectable } from '@angular/core';
import {
    ADJUSTEMENT_LINE,
    ANGLE_PI,
    ANGLE_PI_OVER_EIGHT,
    ANGLE_PI_OVER_FOUR,
    ANGLE_PI_OVER_TWO,
    JonctionType,
    jonctionTypeString,
    ToolSelector,
} from '@app/classes/constant';
import { Tracer } from '@app/classes/tracer';
import { LineCommand } from '@app/classes/undoredoCommands/line-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tracer {
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Line, 'linear_scale', false, 'traceur de Lignes', 'l');
        this.clearPath();
    }
    static minDiameter: number = 1;
    static maxDiameter: number = 25;

    private pathData: Vec2[];

    private click: number = 0;
    private newPathData: Vec2[] = [];
    isEndOfLine: boolean = false;
    private initialPoint: Vec2 = { x: 0, y: 0 };
    private isKeyShiftDown: boolean = false;
    private lastPoint: Vec2 = { x: 0, y: 0 };
    private readonly NUMBER_PIXEL: number = 20;

    jonctionType: JonctionType = JonctionType.Normal;
    // tslint:disable-next-line: variable-name
    private _diameterOfPoints: number = 2;

    jonctionTypeToString(jonctionType: JonctionType): string {
        const type = jonctionTypeString.get(jonctionType);
        if (type == undefined) throw new Error('Invalid jonctionType');
        return type;
    }
    onMouseDown(event: MouseEvent): void {
        if (!this.disableDraw && this.drawingService.mouseOnCanvas) {
            this.click++;
        }
        if (this.click === 1 && this.drawingService.mouseOnCanvas) {
            this.drawingService.saveCanvas();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.initialPoint = this.mouseDownCoord;
            this.newPathData.push(this.mouseDownCoord);
        } else if (this.click > 1 && this.drawingService.mouseOnCanvas) {
            this.mouseDownCoord = this.lastPoint;
            this.newPathData.push(this.mouseDownCoord);
            this.pathData.push(this.mouseDownCoord);
            this.drawingControler(this.drawingService.baseCtx, this.pathData);
            this.clearPath();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Backspace') {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.click = 0;
        } else if (event.key === 'Escape' && this.click >= 1) {
            this.drawingService.restoreCanvas();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.click = 0;
        } else if (event.shiftKey) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.isKeyShiftDown = true;
            this.drawingControler(this.drawingService.previewCtx, this.pathData);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey) {
            this.isKeyShiftDown = false;
        }
    }

    onMouseOver(event: MouseEvent): void {
        this.clearPath();
        this.disableDraw = false;
    }
    get diameterOfPoints(): number {
        return this._diameterOfPoints;
    }

    set diameterOfPoints(diameter: number) {
        if (diameter >= LineService.minDiameter && diameter <= LineService.maxDiameter) {
            this._diameterOfPoints = diameter;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.click >= 1 && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData[0] = this.mouseDownCoord;
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingControler(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.initialize();
        this.disableDraw = true;
        this.clearPath();
    }

    onDoubleClick(event: MouseEvent): void {
        this.initialize();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const xSide = this.getPositionFromMouse(event).x - this.initialPoint.x;
        const ySide = this.getPositionFromMouse(event).y - this.initialPoint.y;
        if (Math.sqrt(xSide * xSide + ySide * ySide) <= this.NUMBER_PIXEL) {
            this.completeLine(this.drawingService.baseCtx, this.newPathData);
        }
        this.newPathData.pop();
        this.undoRedoService.addCommand(
            new LineCommand(this.drawingService, this, this.drawingService.primaryColor, this.newPathData, this.drawingService.baseCtx.lineWidth),
        );
        this.newPathData = [];
    }
    completeLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.drawingService.restoreCanvas();
        ctx.beginPath();
        for (let i = 0; i < path.length - 2; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.lineTo(path[0].x, path[0].y);
        path = [];

        ctx.stroke();
    }
    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        this.lastPoint = path[path.length - 1];
        ctx.lineTo(path[0].x, path[0].y);
        ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
        ctx.stroke();
    }

    drawingControler(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (this.isEndOfLine) {
            this.isEndOfLine = false;
        } else if (!this.isEndOfLine && !this.disableDraw) {
            this.drawingService.enableTrait();
            this.setLineProperty(ctx);
            if (this.jonctionType === JonctionType.WithPoints) {
                this.drawCircle(ctx, path);
            }
            if (this.isKeyShiftDown) {
                this.LineDegreeFix(ctx, path);
            } else {
                if (path.length > 0) {
                    this.drawLine(ctx, path);
                }
            }
        }
    }

    drawingControlerMultipleLines(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (path.length > 0) {
            path.forEach((point, index) => {
                if (index !== path.length - 1) {
                    const nextPoint = path[index + 1];
                    const line: Vec2[] = [point, nextPoint];
                    this.drawLine(ctx, line);
                    if (this.jonctionType === JonctionType.WithPoints) {
                        this.drawCircle(ctx, line);
                    }
                }
            });
        }
    }
    private setLineProperty(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = this.thickness;
        ctx.fillStyle = this.primaryColor;
    }

    drawCircle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, this.diameterOfPoints, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    LineDegreeFix(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        const xSide = path[path.length - 1].x - path[0].x;
        const ySide = path[path.length - 1].y - path[0].y;
        const length = Math.sqrt(xSide * xSide + ySide * ySide);

        let x = 0;
        let y = 0;

        ctx.lineTo(path[0].x, path[0].y);

        if (xSide === 0 && ySide === 0) {
            x = path[0].x + ADJUSTEMENT_LINE;
            y = path[0].y + ADJUSTEMENT_LINE;
        } else if (
            Math.abs(xSide) / length >= Math.cos(ANGLE_PI_OVER_FOUR + ANGLE_PI_OVER_EIGHT) &&
            Math.abs(xSide) / length <= Math.cos(ANGLE_PI_OVER_FOUR - ANGLE_PI_OVER_EIGHT) &&
            Math.abs(ySide) / length <= Math.sin(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR) &&
            Math.abs(ySide) / length >= Math.sin(ANGLE_PI_OVER_FOUR - ANGLE_PI_OVER_EIGHT)
        ) {
            x = path[0].x + length * (xSide / Math.abs(xSide)) * Math.cos(ANGLE_PI_OVER_FOUR);
            y = path[0].y + length * (ySide / Math.abs(ySide)) * Math.sin(ANGLE_PI_OVER_FOUR);
        } else if (
            xSide / length > -Math.cos(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR) &&
            xSide / length < Math.cos(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR) &&
            Math.abs(ySide) / length <= Math.sin(ANGLE_PI_OVER_TWO) &&
            Math.abs(ySide) / length > Math.sin(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR)
        ) {
            x = path[0].x + ADJUSTEMENT_LINE;
            y = path[0].y + (ySide / Math.abs(ySide)) * length * Math.sin(ANGLE_PI_OVER_TWO);
        } else if (
            Math.abs(xSide) / length >= Math.cos(ANGLE_PI_OVER_EIGHT) &&
            Math.abs(xSide) / length <= -Math.cos(ANGLE_PI) &&
            ySide / length > Math.sin(-ANGLE_PI_OVER_EIGHT) &&
            ySide / length < Math.sin(ANGLE_PI_OVER_EIGHT)
        ) {
            x = path[0].x + length * (-(xSide / Math.abs(xSide)) * Math.cos(Math.PI));
            y = path[0].y + ADJUSTEMENT_LINE;
        }

        this.lastPoint = { x, y };
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    initialize(): void {
        this.isEndOfLine = true;
        this.click = 0;
    }
}
