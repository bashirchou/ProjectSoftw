import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ADJUSTEMENT_LINE, JonctionType } from '@app/classes/constant';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
describe('LineService', () => {
    let service: LineService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawControllerSpy: jasmine.Spy<any>;
    let setLinePropertySpy: jasmine.Spy<any>;
    let drawCircleSpy: jasmine.Spy<any>;
    let drawLineFixSpy: jasmine.Spy<any>;
    let drawLineSpy: jasmine.Spy<any>;
    let completeLineSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'restoreCanvas', 'saveCanvas', 'enableTrait']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(LineService);
        drawControllerSpy = spyOn<any>(service, 'drawingControler').and.callThrough();
        drawLineFixSpy = spyOn<any>(service, 'LineDegreeFix').and.callThrough();
        setLinePropertySpy = spyOn<any>(service, 'setLineProperty').and.callThrough();
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        completeLineSpy = spyOn<any>(service, 'completeLine').and.callThrough();
        drawCircleSpy = spyOn<any>(service, 'drawCircle').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = { offsetX: 25, offsetY: 25, button: 0 } as MouseEvent;
    });
    it('when drawing a line onMouseMove, if isKeyShiftDown is true, should call lineDegreeFix', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['isKeyShiftDown'] = true;
        service.disableDraw = false;
        service['click'] = 1;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        expect(drawControllerSpy).toHaveBeenCalled();
        expect(drawLineFixSpy).toHaveBeenCalled();
    });
    it('onDoubleClick will called completeLine if pixels between beginning and endpoint is less than 20', () => {
        service.mouseDownCoord = { x: 2, y: 3 };
        service['pathData'].push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 1, y: 1 };
        service['pathData'].push(service.mouseDownCoord);
        service['initialPoint'] = { x: 0, y: 0 };
        service['newPathData'].push(service.mouseDownCoord);
        service.disableDraw = false;
        const mouseEventMock = { offsetX: 2, offsetY: 2, button: 0 } as MouseEvent;
        service.onDoubleClick(mouseEventMock);
        expect(completeLineSpy).toHaveBeenCalled();
    });
    it('When drawController is called, drawline should not be call if isEndOfLine is true', () => {
        service.mouseDownCoord = { x: 2, y: 3 };
        service['pathData'].push(service.mouseDownCoord);
        service.disableDraw = false;
        service.isEndOfLine = true;
        service.drawingControler(baseCtxStub, service['pathData']);
        expect(setLinePropertySpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
    it('When drawController is called, drawCircle should be call if junctionType enum is JonctionType.WithPoints', () => {
        service.mouseDownCoord = { x: 2, y: 3 };
        service['pathData'].push(service.mouseDownCoord);
        service.isEndOfLine = false;
        service.disableDraw = false;
        service.jonctionType = JonctionType.WithPoints;
        service.drawingControler(baseCtxStub, service['pathData']);
        expect(setLinePropertySpy).toHaveBeenCalled();
        expect(drawCircleSpy).toHaveBeenCalled();
    });
    it('When drawController is called, drawLineFix should be call if isKeyShiftDown is true', () => {
        service.mouseDownCoord = { x: 2, y: 3 };
        service['pathData'].push(service.mouseDownCoord);
        service['isKeyShiftDown'] = true;
        service.disableDraw = false;
        service.isEndOfLine = false;
        service.drawingControler(baseCtxStub, service['pathData']);
        expect(setLinePropertySpy).toHaveBeenCalled();
        expect(drawLineFixSpy).toHaveBeenCalled();
    });

    it('When lineDegreeFix is call and the angle of the line is near 45,135,225,315, the distance betwenn the initial and the last should be equal ', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'].push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 25, y: 27 };
        service['pathData'].push(service.mouseDownCoord);
        service.LineDegreeFix(baseCtxStub, service['pathData']);
        expect(Math.round(service['lastPoint'].x / 10) * 10).toEqual(Math.round(service['lastPoint'].y / 10) * 10);
    });
    it('When lineDegreeFix is call and the angle of the line is near 0 or 180, hte y value of the lastPoint shluld be 0', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'].push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 25, y: 3 };
        service['pathData'].push(service.mouseDownCoord);
        service.LineDegreeFix(baseCtxStub, service['pathData']);
        expect(service['lastPoint'].y).toEqual(0 + ADJUSTEMENT_LINE);
    });
    it('When lineDegreeFix is call and the angle of the line is near 90 or 270, hte y value of the lastPoint shluld be 0', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'].push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 1, y: 30 };
        service['pathData'].push(service.mouseDownCoord);
        service.LineDegreeFix(baseCtxStub, service['pathData']);
        expect(service['lastPoint'].x).toEqual(0 + ADJUSTEMENT_LINE);
    });
    it('the fouction get diameterOfPoints() should be the value that its was being set', () => {
        const expectedResult = 3;
        service.diameterOfPoints = expectedResult;
        expect(service.diameterOfPoints).toEqual(expectedResult);
    });
    it('completeLine calls restoreCanvas() when it is used', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['newPathData'].push(service.mouseDownCoord);
        service['newPathData'].push(service.mouseDownCoord);
        service.completeLine(baseCtxStub, service['newPathData']);
        expect(drawServiceSpy.restoreCanvas).toHaveBeenCalled();
    });
});
