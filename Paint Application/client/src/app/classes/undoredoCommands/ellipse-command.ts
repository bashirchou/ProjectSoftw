import { ShapeType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class EllipseCommand extends Command {
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
        shapeType: ShapeType,
    ) {
        super();
        this.drawingService = drawingService;
        this.path = path;
        this.strokeWidth = strokeWidth;
        this.colorPrimary = colorPrimary;
        this.colorSecondary = colorSecondary;
        this.shapeType = shapeType;
    }

    execute(): void {
        // Test deja fait dans ellipse service
        this.drawingService.baseCtx.beginPath();

        const radiusY = this.path[this.path.length - 1].y - this.path[0].y;
        const radiusX = this.path[this.path.length - 1].x - this.path[0].x;
        this.drawingService.baseCtx.lineWidth = this.strokeWidth;
        this.drawingService.baseCtx.ellipse(this.path[0].x, this.path[0].y, radiusX, radiusY, Math.PI, 0, 2 * Math.PI);

        this.drawingService.enableFormesColor(this.shapeType, this.drawingService.baseCtx, this.colorPrimary, this.colorSecondary);

        if (this.shapeType !== ShapeType.Border) {
            this.drawingService.baseCtx.fill();
        }
        this.drawingService.baseCtx.stroke();
    }
}
