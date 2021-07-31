import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SLOW_RADIAN_SCROLL_ANGLE } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from './stamp.service';

describe('StampService', () => {
    let service: StampService;
    let mouseEvent: MouseEvent;
    let wheelEvent: WheelEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawEtampSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableFormes']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(StampService);
        drawEtampSpy = spyOn(service, 'drawStamp').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        mouseEvent = { offsetX: 25, offsetY: 25, button: 0 } as MouseEvent;
        wheelEvent = {} as WheelEvent;
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

    it(' onMouseUp should call drawStamp if mouseDown is true ', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service['pathData'].push(service.mouseDownCoord);
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEtampSpy).toHaveBeenCalled();
    });

    it(' On vKeyDown should set drawSlowRotation property to true and mouseDown is true', () => {
        const altKeyEventDown = { altKey: true } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyDown(altKeyEventDown);
        expect(service['drawSlowRotation']).toEqual(true);
    });

    it(' On AltKeyDown should not change drawSlowRotation property and mouseDown is true', () => {
        const altKeyEventDown = { altKey: false } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyDown(altKeyEventDown);
        expect(service['drawSlowRotation']).toEqual(false);
    });

    it(' On AltKeyUp should set drawSlowRotation property to false and mouseDown is true', () => {
        const altKeyEventUp = { altKey: false } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyUp(altKeyEventUp);
        expect(service['drawSlowRotation']).toEqual(false);
    });

    it(' On AltKeyUp should not change drawSlowRotation property and mouseDown is true', () => {
        const altKeyEventUp = { altKey: true } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyUp(altKeyEventUp);
        expect(service['drawSlowRotation']).toEqual(false);
    });

    // AUCUNE IDER
    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = { offsetX: 25, offsetY: 25, button: 1 } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    // tslint:disable-next-line: max-line-length
    it(' OnMouseMove, should call drawStamp', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawSlowRotation'] = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        service['pathData'][0].x = 2;
        service['pathData'].push({ x: 1, y: 1 } as Vec2);
        const drawImageSpy = spyOn(drawServiceSpy.baseCtx, 'drawImage');
        service['drawStamp'](drawServiceSpy.baseCtx, service['pathData'][0]);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
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

    it(' onWindowScroll, should call drawEtampe and call rotation if drawSlowRotation  is true', () => {
        service['drawSlowRotation'] = true;
        service.onWindowScroll(wheelEvent, service['pathData'][0]);
        expect(service['drawStamp']).toHaveBeenCalledWith(service['drawingService'].previewCtx, service['pathData'][0]);
    });

    it(' onWindowScroll, should call drawEtampe and call rotation if drawSlowRotation  is false', () => {
        service['drawSlowRotation'] = false;
        service.onWindowScroll(wheelEvent, service['pathData'][0]);
        expect(service['drawStamp']).toHaveBeenCalledWith(service['drawingService'].previewCtx, service['pathData'][0]);
    });

    it(' rotation, should initialize angleInRadians with a soustration if deltaY is negatif', () => {
        const anlge = -10;
        wheelEvent = { deltaY: anlge } as WheelEvent;
        service['angleInRadians'] = anlge;
        service.rotation(SLOW_RADIAN_SCROLL_ANGLE, wheelEvent);
        //  service['angleInRadians'] = service['angleInRadians'] - SLOW_RADIAN_SCROLL_ANGLE;
        expect(Math.round(service['angleInRadians'])).toEqual(Math.round(service['angleInRadians'] - SLOW_RADIAN_SCROLL_ANGLE));
    });

    it(' rotation, should initialize angleInRadians with a addition if deltaY is positif', () => {
        const anlge = 10;
        wheelEvent = { deltaY: anlge } as WheelEvent;
        service['angleInRadians'] = anlge;
        service.rotation(SLOW_RADIAN_SCROLL_ANGLE, wheelEvent);
        // service['angleInRadians'] = service['angleInRadians'] + SLOW_RADIAN_SCROLL_ANGLE;
        expect(Math.round(service['angleInRadians'])).toEqual(Math.round(service['angleInRadians'] + SLOW_RADIAN_SCROLL_ANGLE));
    });
});
