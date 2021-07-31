import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { Command } from './command';

interface Spray {
    angle: number[];
    radius: number[];
    path: Vec2;
    goutteDiameter: number;
    rotation: number;
    beginAngle: number;
    endAngle: number;
}

export class AerosolCommand extends Command {
    aerosolService: AerosolService;
    drawingService: DrawingService;
    sprayTab: Spray[] = [];
    colorCurrent: string;

    constructor(aerosolService: AerosolService, drawingService: DrawingService, sprayTab: Spray[], colorCurrent: string) {
        super();
        this.drawingService = drawingService;
        this.aerosolService = aerosolService;
        this.colorCurrent = colorCurrent;
        this.sprayTab = sprayTab;
    }

    execute(): void {
        // Test deja fait dans aerosol service
        this.drawingService.primaryColor = this.colorCurrent;
        for (const spray of this.sprayTab) {
            this.aerosolService.spray(
                this.drawingService,
                spray.angle,
                spray.radius,
                spray.path,
                spray.goutteDiameter,
                spray.rotation,
                spray.beginAngle,
                spray.endAngle,
                this.colorCurrent,
            );
        }
    }
}
