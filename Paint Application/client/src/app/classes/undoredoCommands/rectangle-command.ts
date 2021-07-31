import { ShapeType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class RectangleCommand extends Command {
    drawingService: DrawingService;
    colorPrimary: string;
    colorSecondary: string;
    path: Vec2[];
    strokeWidth: number;
    height: number;
    width: number;
    shapeType: ShapeType;
    constructor(
        drawingService: DrawingService,
        path: Vec2[],
        strokeWidth: number,
        colorPrimary: string,
        colorSecondary: string,
        height: number,
        width: number,
        shapeType: ShapeType,
    ) {
        super();
        this.drawingService = drawingService;
        this.path = path;
        this.strokeWidth = strokeWidth;
        this.colorPrimary = colorPrimary;
        this.colorSecondary = colorSecondary;
        this.height = height;
        this.width = width;
        this.shapeType = shapeType;
    }

    execute(): void {
        // Test sont deja fait dans rectangle service..
        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.moveTo(this.path[0].x, this.path[0].y);

        this.drawingService.baseCtx.lineWidth = this.strokeWidth;
        this.drawingService.baseCtx.rect(this.path[0].x, this.path[0].y, this.width, this.height);

        this.drawingService.enableFormesColor(this.shapeType, this.drawingService.baseCtx, this.colorPrimary, this.colorSecondary);

        if (this.shapeType !== ShapeType.Border) {
            this.drawingService.baseCtx.fill();
        }
        this.drawingService.baseCtx.stroke();
    }
}
