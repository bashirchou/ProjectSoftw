import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class EraserCommand extends Command {
    path: Vec2[];

    drawingService: DrawingService;
    thickness: number;
    color: string;
    constructor(drawingService: DrawingService, path: Vec2[], thickness: number, color: string) {
        super();
        this.drawingService = drawingService;
        this.path = path;
        this.thickness = thickness;
        this.color = color;
    }
    execute(): void {
        // Test deja fait dans eraser service
        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.moveTo(this.path[0].x, this.path[0].y);
        // this.drawingService.enableTrait();
        for (const path of this.path) {
            this.drawingService.baseCtx.lineWidth = this.thickness;
            this.drawingService.baseCtx.strokeStyle = 'white';
            this.drawingService.baseCtx.lineTo(path.x, path.y);
        }
        this.drawingService.baseCtx.stroke();
    }
}
