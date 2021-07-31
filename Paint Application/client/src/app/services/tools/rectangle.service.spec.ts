import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
// tslint:disable:no-any
describe('RectangleService', () => {
    let mouseEvent: MouseEvent;
    let keyBoardEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawRectangleSpy: jasmine.Spy<any>;
    let drawSquareSpy: jasmine.Spy<any>;
    let service: RectangleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableFormes']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(RectangleService);
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();
        drawSquareSpy = spyOn<any>(service, 'drawSquare').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        keyBoardEvent = { shiftKey: true } as KeyboardEvent;
        mouseEvent = { offsetX: 25, offsetY: 25, button: 0 } as MouseEvent;
        service['drawingService'].mouseOnCanvas = true;
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
        service.pathData.push(service.mouseDownCoord);
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });
    it(' onMouseUp should call chooseForm if mouseDown is true ', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.pathData.push(service.mouseDownCoord);
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });
    it(' On ShiftKeyDown should set isDrawSquare property to true', () => {
        service.onKeyDown(keyBoardEvent);
        expect(service['isDrawSquare']).toEqual(true);
    });
    it(' On ShiftKeyUp should set isDrawSquare property to false', () => {
        const shiftKeyEventUp = { shiftKey: false } as KeyboardEvent;
        service.onKeyUp(shiftKeyEventUp);
        expect(service['isDrawSquare']).toEqual(false);
    });
    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = { offsetX: 25, offsetY: 25, button: 1 } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });
    it(' OnMouseMove, should call drawSquare if mouseDown and isDrawSquare is true', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['isDrawSquare'] = true;
        service.disableDraw = false;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it(' onShiftKeyDown, should call drawSquare if mouseDown is true', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDown = true;
        service.disableDraw = false;
        service.onKeyDown(keyBoardEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
    });
    it(' onShiftKeyUp, should call drawRectangle if mouseDown is true and set isDrawSquare property to false', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDown = true;
        service.disableDraw = false;
        const shiftKeyEventUp = { shiftKey: false } as KeyboardEvent;
        service.onKeyUp(shiftKeyEventUp);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(service['isDrawSquare']).toEqual(false);
    });
    it(' onMouseMove should call drawRectangle if mouse was already down', () => {
        service.mouseDown = true;
        service.disableDraw = false;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawRectangle if mouse was not already down', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
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
    it('If disableDraw is true, drawRectangle or drawSquare should  not be  called.', () => {
        service.chooseForm(baseCtxStub, service.pathData);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });
    it('the width and the height of drawRectanglePointiller should not be smaller than the min canvas', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.drawRectanglePointiller(baseCtxStub, service.pathData);
        expect(service['width']).toEqual(MIN_CANVAS_WIDTH);
        expect(service['height']).toEqual(MIN_CANVAS_HEIGHT);
    });
});
