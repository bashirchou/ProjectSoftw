import { SelectorType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection.service';
import { Command } from './command';
export class SelectionCommand extends Command {
    drawingService: DrawingService;
    selectionService: SelectionService;
    pathData: Vec2[];
    width: number;
    height: number;
    dwidth: number;
    dheight: number;
    lowerLimit: Vec2;
    mousePosition: Vec2;
    ajustementVec: Vec2;
    selectorType: SelectorType;
    constructor(
        drawingService: DrawingService,
        selectionService: SelectionService,
        pathData: Vec2[],
        lowerLimit: Vec2,
        width: number,
        height: number,
        dwidth: number,
        dheight: number,
        selectorType: SelectorType,
    ) {
        super();
        this.drawingService = drawingService;
        this.selectionService = selectionService;
        this.pathData = pathData;
        this.width = width;
        this.lowerLimit = lowerLimit;
        this.height = height;
        this.dwidth = dwidth;
        this.dheight = dheight;
        this.selectorType = selectorType;
    }

    execute(): void {
        this.selectionService.drawSelectedForm(this.drawingService.baseCtx, this.lowerLimit.x, this.lowerLimit.y);
    }
}
