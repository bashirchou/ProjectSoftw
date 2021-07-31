import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectorType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { SelectionDrawingService } from './selection-drawing.service';
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
describe('SelectionDrawingService', () => {
    let service: SelectionDrawingService;
    let lowerLimit: Vec2;
    let upperLimit: Vec2;
    const path: Vec2[] = [];
    let thickness: number;
    let canvasTestHelper: CanvasTestHelper;
    let ctx: CanvasRenderingContext2D;
    let selectorType: SelectorType;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ctx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectionDrawingService);
        path.push({ x: 0, y: 0 });
        path.push({ x: 2, y: 2 });
        lowerLimit = { x: 0, y: 0 };
        upperLimit = { x: 1, y: 1 };
        thickness = 2;
        selectorType = SelectorType.Rectangle;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('ControlPoint, ctx.lineTo is called 8 times ', () => {
        const lineToSpy = spyOn<any>(ctx, 'lineTo').and.callThrough();
        const moveToSpy = spyOn<any>(ctx, 'moveTo').and.callThrough();
        const strokeSpy = spyOn<any>(ctx, 'stroke').and.callThrough();
        service.controlPoints(ctx, lowerLimit, upperLimit, thickness);

        expect(lineToSpy).toHaveBeenCalledTimes(8);
        expect(moveToSpy).toHaveBeenCalledTimes(8);
        expect(strokeSpy).toHaveBeenCalled();
        expect(ctx.lineCap).toEqual('round');
    });
    it('DrawBorder calls ControlPoint, ctx.strokeRect. ctx.Ellipse is called when selectorType.ellipse', () => {
        const controlSpy = spyOn<any>(service, 'controlPoints').and.callThrough();
        const ellipseSpy = spyOn<any>(ctx, 'ellipse').and.callThrough();
        const strokeSpy = spyOn<any>(ctx, 'stroke').and.callThrough();
        selectorType = SelectorType.Ellipse;
        service.drawBorder(ctx, lowerLimit, upperLimit, thickness, selectorType, path);
        expect(controlSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
        expect(ctx.lineWidth).toEqual(1);
    });
    it('DrawBorder calls ControlPoint, if selectorType.polygonal, call LineTo.', () => {
        const lineSpy = spyOn<any>(ctx, 'lineTo').and.callThrough();
        const closeSpy = spyOn<any>(ctx, 'closePath').and.callThrough();
        selectorType = SelectorType.Polygonal;
        service.drawBorder(ctx, lowerLimit, upperLimit, thickness, selectorType, path);
        expect(lineSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
        expect(ctx.lineWidth).toEqual(1);
    });
});
