import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line.service';
import { Command } from './command';

export class LineCommand extends Command {
    constructor(
        private drawingService: DrawingService,
        private lineService: LineService,
        private colorPrimary: string,
        private newPathData: Vec2[],
        private lineWidth: number,
    ) {
        super();
    }

    execute(): void {
        // Test deja fait dans line service
        this.drawingService.baseCtx.strokeStyle = this.colorPrimary;
        this.drawingService.baseCtx.lineWidth = this.lineWidth;
        this.drawingService.baseCtx.fillStyle = this.colorPrimary;
        this.lineService.initialize();
        this.lineService.isEndOfLine = false;
        this.lineService.disableDraw = false;

        this.lineService.drawingControlerMultipleLines(this.drawingService.baseCtx, this.newPathData);
    }
}
