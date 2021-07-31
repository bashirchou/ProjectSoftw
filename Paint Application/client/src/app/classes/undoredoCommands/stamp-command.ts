import { Command } from '@app/classes/undoredoCommands/command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from '@app/services/tools/stamp.service';

export class StampCommand extends Command {
    constructor(
        private stampService: StampService,
        private cxt: CanvasRenderingContext2D,
        private path: Vec2,
        private stampArrayPos: number,
        private drawingService: DrawingService,
    ) {
        super();
    }
    execute(): void {
        this.stampService.stampArray = this.stampArrayPos;
        const before = this.drawingService.mouseOnCanvas;
        this.drawingService.mouseOnCanvas = true;
        this.stampService.drawStamp(this.cxt, this.path);
        this.drawingService.mouseOnCanvas = before;
    }
}
