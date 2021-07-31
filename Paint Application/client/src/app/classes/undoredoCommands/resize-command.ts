import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class ResizeCommand extends Command {
    drawingService: DrawingService;
    width: number;
    height: number;
    minVisibleWorkingZone: number = 100;
    marginX: number = 3;
    marginY: number = 3;
    controlPointDiameter: number = 15;
    constructor(drawingService: DrawingService, height: number, width: number) {
        super();
        this.drawingService = drawingService;
        this.height = height;
        this.width = width;
    }

    execute(): void {
        // les test de drawing verifie deja ces fonction..
        this.drawingService.resize(this.width, this.height);

        this.drawingService.resizePreviewCtx.clearRect(
            0,
            0,
            this.drawingService.resizePreviewCtx.canvas.width,
            this.drawingService.resizePreviewCtx.canvas.height,
        );

        this.drawingService.drawControlPoints();
    }
}
