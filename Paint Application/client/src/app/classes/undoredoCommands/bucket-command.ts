import { Point } from '@app/classes/point';
import { Command } from '@app/classes/undoredoCommands/command';
import { BucketPaintingService } from '@app/services/tools/bucket-painting.service';

export class BucketCommand extends Command {
    constructor(private bucketPaintingService: BucketPaintingService, private isLeftClick: boolean, private clickedPoint: Point) {
        super();
    }
    execute(): void {
        this.bucketPaintingService.setClickedColor(this.clickedPoint);
        if (this.isLeftClick) {
            this.bucketPaintingService.contiguousPixel(this.clickedPoint);
        } else {
            this.bucketPaintingService.noContiguousPixel();
        }
    }
}
