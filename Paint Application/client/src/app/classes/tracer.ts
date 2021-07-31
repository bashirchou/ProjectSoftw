import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelector } from './constant';
import { Tool } from './tool';

export class Tracer extends Tool {
    couleurTrait: string = 'black';

    constructor(
        protected drawingService: DrawingService,
        toolSelector: ToolSelector,
        icon?: string,
        custumIcon?: boolean,
        name?: string,
        shortcut?: string,
    ) {
        super(drawingService, toolSelector, icon, custumIcon, name, shortcut);
    }
}
