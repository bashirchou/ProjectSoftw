/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
// tslint:disable-next-line: no-relative-imports
import { DrawingService } from '../drawing/drawing.service';
import { EraserService } from './eraser.service';

describe('Service: Eraser', () => {
    let service: EraserService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EraserService, DrawingService],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EraserService);
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });
    // tslint:disable-next-line: no-shadowed-variable
    it('should create eraser service', inject([EraserService], (service: EraserService) => {
        expect(service).toBeTruthy();
    }));
    it('onMouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });
    it('onMouseDown should pass push new data into the pathData variable if mouseOver is set to true', () => {
        const expectedResult = { x: mouseEvent.offsetX + 1, y: mouseEvent.offsetY + 1 };
        service['mouseOver'] = true; // set MouseOver to true;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseDown(mouseEvent);
        expect(service['pathData'][service['pathData'].length - 1]).toEqual(expectedResult);
    });
    it('Should call the eraseLine method onMouseDown', () => {
        const spy = spyOn(service, 'eraseLine');
        service['drawingService'].mouseOnCanvas = true;

        service.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it('Should call the clearPath method onMouseUp', () => {
        const spy = spyOn(service, 'clearPath');
        service.onMouseUp(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it('Should call eraseLine with the new updated pathData onMouseUp', () => {
        const expectedResult = { x: mouseEvent.offsetX + 1, y: mouseEvent.offsetY + 1 };
        const expectedPathData = service['pathData'];
        expectedPathData.push(expectedResult);
        const spy = spyOn(service, 'eraseLine');
        service.mouseDown = true; // enter if Stattement
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseUp(mouseEvent);
        expect(spy).toHaveBeenCalledWith(service.drawingService.baseCtx, expectedPathData);
    });
    it('Should call eraseLine with the new updated pathData onMouseMove', () => {
        const expectedResult = { x: mouseEvent.offsetX + 1, y: mouseEvent.offsetY + 1 };
        const expectedPathData = service['pathData'];
        expectedPathData.push(expectedResult);
        const spy = spyOn(service, 'eraseLine');
        service.mouseDown = true; // enter if Stattement
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalledWith(service.drawingService.baseCtx, expectedPathData);
    });
    it('Should set mouseOver to true onMouseOver function call', () => {
        service.mouseDown = true;
        service['drawingService'].mouseOnCanvas = true;
        service.onMouseOver(mouseEvent);
        expect(service['mouseOver']).toBeTrue();
    });
    it('Should not call eraseLine method onMouseUp if mouseDown is set to false', () => {
        const spy = spyOn(service, 'eraseLine');
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(spy).not.toHaveBeenCalled();
    });
    it('Should not call eraseLine method onMouseDown if the mouseEvent button property is not 0 (The left mouse button)', () => {
        const spy = spyOn(service, 'eraseLine');
        const mouseEvent2 = { ...mouseEvent, button: 1 };
        service.onMouseDown(mouseEvent2);
        expect(spy).not.toHaveBeenCalled();
    });
    it('Should not call eraseLine method onMouseMove if mouseDown is set to false', () => {
        const spy = spyOn(service, 'eraseLine');
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(spy).not.toHaveBeenCalled();
    });
});
