import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
describe('LineService', () => {
    // tslint:disable:no-any
    let service: LineService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawControllerSpy: jasmine.Spy<any>;
    let shiftKeyBoardEvent: KeyboardEvent;
    let escapeKeyBoardEvent: KeyboardEvent;
    let backspaceKeyBoardEvent: KeyboardEvent;

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

        // Configuration du spy du service
        // tslint:disable:no-string-literal

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        shiftKeyBoardEvent = { shiftKey: true } as KeyboardEvent;
        escapeKeyBoardEvent = { key: 'Escape' } as KeyboardEvent;
        backspaceKeyBoardEvent = { key: 'Backspace' } as KeyboardEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service['click'] = 0;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(drawServiceSpy.saveCanvas).toHaveBeenCalled();
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });
    it(' mouseDown should call drawingController if click is greater than 1', () => {
        service['click'] = 2;
        service.disableDraw = false;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(drawControllerSpy).toHaveBeenCalled();
    });
    it(' onMouseMove should call drawLine if the click count is greater or equal to 1', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['click'] = 1;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawControllerSpy).toHaveBeenCalled();
    });
    it(' onMouseMove should not call drawLine if click is zero', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['click'] = 0;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawControllerSpy).not.toHaveBeenCalled();
    });
    it('OnMouseOver should set disableDraw to false', () => {
        service.onMouseOver(mouseEvent);
        expect(service.disableDraw).toEqual(false);
    });

    it('OnMouseLeave should set disableDraw to true', () => {
        service.onMouseLeave(mouseEvent);
        expect(service.disableDraw).toEqual(true);
    });
    it('OnDoubleClick should set click to zero and isEndOfLine to true', () => {
        service.onDoubleClick(mouseEvent);
        expect(service['click']).toEqual(0);
        expect(service.isEndOfLine).toEqual(true);
    });
    it('On mouseLeave should set the value of click to zero and isEndOfLine to true', () => {
        service.onMouseLeave(mouseEvent);
        expect(service['click']).toEqual(0);
        expect(service.isEndOfLine).toEqual(true);
    });
    it('On mouseDown if disableDraw is true, click value should not incremente', () => {
        const expectedResult = 0;
        service['click'] = 0;
        service.disableDraw = true;

        service.onMouseDown(mouseEvent);
        expect(service['click']).toEqual(expectedResult);
    });
    it('OnmouseLeave should set the property of isEndOfLine to true', () => {
        service.onMouseLeave(mouseEvent);
        expect(service.isEndOfLine).toEqual(true);
    });
    it('On mouseDown, if click is equal to 1, initial point should be equal to the position of the mouse ', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service['click'] = 1;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(service['initialPoint']).toEqual(expectedResult);
    });
    it('OnKeyUp should set isKeyShiftDown to false', () => {
        const shiftKeyEventUp = {
            shiftKey: false,
        } as KeyboardEvent;
        service.onKeyUp(shiftKeyEventUp);
        expect(service['isKeyShiftDown']).toEqual(false);
    });
    it('OnKeyDown (with Shift clicked) call LineDegreeFix', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'].push(service.mouseDownCoord);
        service.onKeyDown(shiftKeyBoardEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawControllerSpy).toHaveBeenCalled();
    });
    it('OnKeyDown (with Escaped clicked) call clearCanvas', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['click'] = 1;

        service['pathData'].push(service.mouseDownCoord);

        service.onKeyDown(escapeKeyBoardEvent);

        expect(drawServiceSpy.restoreCanvas).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('OnKeyDown (with Backspace clicked) call clearCanvas', () => {
        service.onKeyDown(backspaceKeyBoardEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
});
