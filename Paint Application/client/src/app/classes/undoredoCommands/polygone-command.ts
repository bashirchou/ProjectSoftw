import { Polygontype, ShapeType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import { Command } from './command';

export class PolygoneCommand extends Command {
    constructor(
        private drawingService: DrawingService,
        private path: Vec2[],
        private colorPrimary: string,
        private colorSecondary: string,
        private height: number,
        private width: number,
        private shapeType: ShapeType,
        private polygonType: Polygontype,
        private shift: number,
        private radius: number,
        private centerAngle: number,
        private centerSquare: Vec2,
        private polygoneService: PolygonService,
    ) {
        super();
    }

    execute(): void {
        this.polygoneService.disableDraw = false;
        this.centerSquare = { x: this.path[0].x + this.width / 2, y: this.path[0].y + this.height / 2 };
        (this.polygoneService.centerSquare = this.centerSquare),
            (this.polygoneService.polygonType = this.polygonType),
            (this.polygoneService.shapeType = this.shapeType),
            (this.polygoneService.radius = this.radius),
            (this.polygoneService.centerAngle = this.centerAngle),
            (this.polygoneService.rectangleHeight = this.height),
            (this.polygoneService.rectangleWidth = this.width),
            (this.polygoneService.shift = this.shift);
        this.polygoneService.drawPolygon(this.drawingService.baseCtx, this.path, this.colorPrimary, this.colorSecondary);
    }
}
