import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class PencilCommand extends Command {
    path: Vec2[];
    strokeWidth: number;
    color: string;
    drawingService: DrawingService;

    constructor(drawingService: DrawingService, path: Vec2[], strokeWidth: number, color: string) {
        super();
        this.drawingService = drawingService;
        this.path = path;
        this.strokeWidth = strokeWidth;
        this.color = color;
    }

    execute(): void {
        // Test deja fait dans pencil service
        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.moveTo(this.path[0].x, this.path[0].y);
        for (const path of this.path) {
            this.drawingService.baseCtx.lineWidth = this.strokeWidth;
            this.drawingService.baseCtx.strokeStyle = this.color;
            this.drawingService.baseCtx.lineTo(path.x, path.y);
        }
        this.drawingService.baseCtx.stroke();
    }
}
