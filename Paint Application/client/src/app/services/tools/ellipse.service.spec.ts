import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ShapeType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from './ellipse.service';
// tslint:disable:no-any
describe('EllipseService', () => {
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawRectangleSpy: jasmine.Spy<any>;
    let drawEllipseSpy: jasmine.Spy<any>;
    let service: EllipseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableFormes']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(EllipseService);
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();
        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.callThrough();
        // tslint:disable:no-string-literal
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

    it(' onMouseUp should set mouseDown property to false ', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'].push(service.mouseDownCoord);
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawEllipse and drawRectangle if mouseDown is true ', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service['pathData'].push(service.mouseDownCoord);
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it(' On ShiftKeyDown should set drawCircle property to true', () => {
        const shiftKeyEventDown = { shiftKey: true } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyDown(shiftKeyEventDown);
        expect(service['drawCircle']).toEqual(true);

        expect(service['drawEllipse']).toHaveBeenCalledWith(service['drawingService'].previewCtx, service['pathData'], service.thickness);
    });

    it(' On ShiftKeyUp should set drawCircle property to false and mouseDown is true', () => {
        const shiftKeyEventUp = { shiftKey: false } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyUp(shiftKeyEventUp);
        expect(service['drawCircle']).toEqual(false);
        expect(service['drawEllipse']).toHaveBeenCalledWith(service['drawingService'].previewCtx, service['pathData'], service.thickness);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = { offsetX: 25, offsetY: 25, button: 1 } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' OnMouseMove, should call drawEllipse(circle) and drawRectangle if mouseDown and drawCircle is true from the left to the right', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawCircle'] = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    // tslint:disable-next-line: max-line-length
    it(' OnMouseMove, should call drawEllipse(circle) and drawRectangle if mouseDown and drawCircle is true and drawing from the right to the left', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawCircle'] = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        service['pathData'][0].x = 2;
        service['pathData'].push({ x: 1, y: 1 } as Vec2);
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'arc').and.callThrough();
        service['drawEllipse'](drawServiceSpy.baseCtx, service['pathData'], 1);
        expect(arcSpy).toHaveBeenCalledWith(
            service['pathData'][0].x,
            service['pathData'][0].y,
            -(service['pathData'][service['pathData'].length - 1].x - service['pathData'][0].x),
            2 * Math.PI,
            0,
        );
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' OnMouseMove, should call drawEllipse and drawRectangle if mouseDown and drawCircle is true and drawing from the left to the right', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawCircle'] = false;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        service['pathData'][0].y = 2;
        service['pathData'][0].x = 1;
        service['pathData'].push({ x: 2, y: 1 } as Vec2);
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'ellipse').and.callThrough();
        service['drawEllipse'](drawServiceSpy.baseCtx, service['pathData'], 1);
        expect(arcSpy).toHaveBeenCalledWith(
            service['pathData'][0].x,
            service['pathData'][0].y,
            service['pathData'][service['pathData'].length - 1].x - service['pathData'][0].x,
            -(service['pathData'][service['pathData'].length - 1].y - service['pathData'][0].y),
            Math.PI,
            0,
            2 * Math.PI,
        );

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' OnMouseMove, should call drawEllipse and drawRectangle if mouseDown and drawCircle is true and drawing from the right to the left', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawCircle'] = false;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        service['pathData'][0].y = 1;
        service['pathData'][0].x = 2;
        service['pathData'].push({ x: 1, y: 2 } as Vec2);
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'ellipse').and.callThrough();
        service['drawEllipse'](drawServiceSpy.baseCtx, service['pathData'], 1);
        expect(arcSpy).toHaveBeenCalledWith(
            service['pathData'][0].x,
            service['pathData'][0].y,
            -(service['pathData'][service['pathData'].length - 1].x - service['pathData'][0].x),
            service['pathData'][service['pathData'].length - 1].y - service['pathData'][0].y,
            Math.PI,
            0,
            2 * Math.PI,
        );
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' OnMouseMove, should call drawEllipse and drawRectangle if mouseDown and drawCircle is true and drawing from the right to the left', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawCircle'] = false;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        service['pathData'][0].y = 2;
        service['pathData'][0].x = 2;
        service['pathData'].push({ x: 1, y: 1 } as Vec2);
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'ellipse').and.callThrough();
        service['drawEllipse'](drawServiceSpy.baseCtx, service['pathData'], 1);
        expect(arcSpy).toHaveBeenCalledWith(
            service['pathData'][0].x,
            service['pathData'][0].y,
            -(service['pathData'][service['pathData'].length - 1].x - service['pathData'][0].x),
            -(service['pathData'][service['pathData'].length - 1].y - service['pathData'][0].y),
            Math.PI,
            0,
            2 * Math.PI,
        );
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' when shapeType is not border the canvas should be fill', () => {
        service['shapeType'] = ShapeType.Full;
        service.disableDraw = false;
        service['pathData'].push({ x: 1, y: 1 } as Vec2);
        service['pathData'].push({ x: 1, y: 1 } as Vec2);
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'fill').and.callThrough();
        service['drawEllipse'](drawServiceSpy.baseCtx, service['pathData'], 1);
        expect(arcSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawEllipse and drawRectangle if mouse was already down', () => {
        service.mouseDown = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawRectangle and drawRectangle if mouse was not already down', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseLeave should change disableDraw to true', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseLeave(mouseEvent);
        expect(service.disableDraw).toEqual(true);
    });

    it(' onMouseOver  should change disableDraw to false', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseOver(mouseEvent);
        expect(service.disableDraw).toEqual(false);
    });
});
