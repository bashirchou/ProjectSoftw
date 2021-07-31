import { DrawingService } from '@app/services/drawing/drawing.service';
import { GroupSelector, ShapeType, shapeTypeString, ToolSelector } from './constant';
import { Tool } from './tool';

export class Shape extends Tool {
    constructor(drawingService: DrawingService, tools: ToolSelector, maticon: string, custumIcon: boolean, nom: string, raccourcis: string) {
        super(drawingService, tools, maticon, custumIcon, nom, raccourcis);
        this.groupSelector = GroupSelector.Shape;
    }
    shapeType: ShapeType = ShapeType.Border;

    static shapeToString(shape: ShapeType): string {
        const shapeString = shapeTypeString.get(shape);
        if (shapeString == undefined) throw new Error('Invalid Shape Type');
        return shapeString;
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }

    toString(): string {
        return Shape.shapeToString(this.shapeType);
    }
}
