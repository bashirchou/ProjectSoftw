import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

// tslint:disable:no-any
// tslint:disable:no-magic-numbers
// tslint:disable:no-string-literal
describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawRectangleSpy: jasmine.SpyObj<any>;
    let drawPolygonSpy: jasmine.SpyObj<any>;
    let drawCircleSpy: jasmine.SpyObj<any>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableFormesColor', 'enableTrait']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(PolygonService);
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();
        drawCircleSpy = spyOn<any>(service, 'drawCircle').and.callThrough();
        drawPolygonSpy = spyOn<any>(service, 'drawPolygon').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        mouseEvent = { offsetX: 25, offsetY: 25, button: 0 } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });
    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });
    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });
    it(' onMouseUp should set mouseDown property to false ', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseLeave  should change disableDraw is true', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseLeave(mouseEvent);
        expect(service.disableDraw).toEqual(true);
    });
    it(' onMouseOver  should change disableDraw is false', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseOver(mouseEvent);
        expect(service.disableDraw).toEqual(false);
    });
    it('OnMouseDown, if mouseDown is true, call drawControl', () => {
        service.mouseDown = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalled();
    });
    it('If disableDraw is true, drawRectangle or drawCircle is not called.', () => {
        service.drawControl(baseCtxStub, service.pathData);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawCircleSpy).not.toHaveBeenCalled();
    });
    it('onMouseUp, if mouseDown is true, DrawPolygon is called.', () => {
        service.mouseDown = true;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPolygonSpy).toHaveBeenCalled();
    });
    it('onMouseMove, if mouseDown is true, DrawControl is called.', () => {
        service.mouseDown = true;
        service.disableDraw = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['drawingService'].mouseOnCanvas = true;
        service.pathData.push(service.mouseDownCoord);
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('If the width of the rectangle is smaller than the height, the radius becomes the width.', () => {
        const expectedResult = 0.5;
        service.disableDraw = false;
        service.mouseDownCoord = { x: 2, y: 2 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 3, y: 10 };
        service.pathData.push(service.mouseDownCoord);
        service.rectangleHeight = 8;
        service.rectangleWidth = 1;
        // service.radius = expectedResult;

        service.drawPolygon(baseCtxStub, service.pathData, service['drawingService'].primaryColor, service['drawingService'].secondaryColor);
        expect(service.radius).toEqual(expectedResult);
    });
    it('If the height of the rectangle is smaller than the width, the radius becomes the height.', () => {
        const expectedResult = 0.5;
        service.disableDraw = false;
        service.mouseDownCoord = { x: 2, y: 2 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 10, y: 3 };
        service.pathData.push(service.mouseDownCoord);
        service.rectangleHeight = 8;
        service.rectangleWidth = 1;
        // service.radius = expectedResult;
        service.drawPolygon(baseCtxStub, service.pathData, service['drawingService'].primaryColor, service['drawingService'].secondaryColor);
        expect(service.radius).toEqual(expectedResult);
    });
    it('If the height of the rectangle is smaller than the width, half the height is added to centerSquare.', () => {
        const expectedResult = { x: 2.5, y: 2.5 };
        service.disableDraw = false;
        service.centerSquare = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 2, y: 2 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDownCoord = { x: 10, y: 3 };
        service.pathData.push(service.mouseDownCoord);
        service.drawRectangle(baseCtxStub, service.pathData);
        expect(service.centerSquare).toEqual(expectedResult);
    });
});
