import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ControlPointLocation, SelectorType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from './selection.service';
// tslint:disable:no-any
// tslint:disable:max-file-line-count
// tslint:disable:no-magic-numbers
describe('SelectionService', () => {
    const path: Vec2[] = [];
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    let initializeSpy: jasmine.Spy<any>;
    let service: SelectionService;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableFormes', 'saveCanvas', 'enableSelect', 'restoreCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        mouseEvent = {
            offsetX: 50,
            offsetY: 50,
            button: 0,
        } as MouseEvent;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectionService);
        initializeSpy = spyOn<any>(service, 'initialize').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;

        service['pathData'].push({ x: 0, y: 0 });
        service['pathData'].push({ x: 1, y: 1 });
        service['linePath'].push({ x: 0, y: 0 });
        service['linePath'].push({ x: 2, y: 2 });
        service['linePath'].push({ x: 5, y: 3 });
        path.push({ x: 0, y: 0 });
        path.push({ x: 1, y: 2 });
        service['drawingService'].mouseOnCanvas = true;
        service['lowerLimit'].x = 0;
        service['upperLimit'].x = 1;
        service['lowerLimit'].y = 0;
        service['upperLimit'].y = 1;
        service['width'] = 10;
        service['height'] = 10;
        service['dwidth'] = 10;
        service['dheight'] = 10;
        /*service['drawingService'].canvas.onload = function(service['clipImage'] = service['drawingService'].baseCtx.getImageData(
            0,
            0,
            service['drawingService'].canvas.width,
            service['drawingService'].canvas.height,
        );*/
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('on polygonalCommand if mouseOnCanvas is true, nClick?Line should be incremented', () => {
        const expectedResult = service['nClickLine'] + 1;
        service.polygonalCommand({ x: 0, y: 0 }, mouseEvent);
        expect(service['nClickLine']).toEqual(expectedResult);
    });

    it('on polygonalCommand if nClickLine is equal to 1, initialPoint and mouseDownCoord should = mouse position', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service.polygonalCommand({ x: mouseEvent.offsetX, y: mouseEvent.offsetY }, mouseEvent);
        expect(service['initialPoint']).toEqual(expectedResult);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('on polygonalCommand if nClickLine is equal to 3, and distance is smaller than 20 pixel, call selectedRectangle.', () => {
        const selectionRectangleSpy = spyOn<any>(service, 'selectedRectangle').and.callThrough();
        service['initialPoint'] = { x: 1, y: 1 };
        service['nClickLine'] = 3;
        service.polygonalCommand({ x: 5, y: 5 }, mouseEvent);
        expect(selectionRectangleSpy).toHaveBeenCalled();
    });

    it('on drawingCommand if controlPointLocation is topRight, upperX and lowerY should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.topRight;
        service.drawingCommand(mousePosition);
        expect(service['lowerLimit'].y).toEqual(mousePosition.y);
        expect(service['upperLimit'].x).toEqual(mousePosition.x);
    });

    it('on drawingCommand if controlPointLocation is topLeft, lowerX and lowerY should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.topLeft;
        service.drawingCommand(mousePosition);
        expect(service['lowerLimit'].y).toEqual(mousePosition.y);
        expect(service['lowerLimit'].x).toEqual(mousePosition.x);
    });
    it('on drawingCommand if controlPointLocation is bottomRight, upperX and upperY should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.bottomRight;
        service.drawingCommand(mousePosition);
        expect(service['upperLimit'].y).toEqual(mousePosition.y);
        expect(service['upperLimit'].x).toEqual(mousePosition.x);
    });
    it('on drawingCommand if controlPointLocation is bottomLeft, upperY and lowerX should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.bottomLeft;
        service.drawingCommand(mousePosition);
        expect(service['upperLimit'].y).toEqual(mousePosition.y);
        expect(service['lowerLimit'].x).toEqual(mousePosition.x);
    });
    it('on drawingCommand if controlPointLocation is middleLeft, lowerX should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.middleLeft;
        service.drawingCommand(mousePosition);
        expect(service['lowerLimit'].x).toEqual(mousePosition.x);
    });
    it('on drawingCommand if controlPointLocation is middleRight, lowerX should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.middleRight;
        service.drawingCommand(mousePosition);
        expect(service['upperLimit'].x).toEqual(mousePosition.x);
    });
    it('on drawingCommand if controlPointLocation is middleBottom, lowerX should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.middleBottom;
        service.drawingCommand(mousePosition);
        expect(service['upperLimit'].y).toEqual(mousePosition.y);
    });
    it('on drawingCommand if controlPointLocation is middleTop, lowerX should equal to mousePosition', () => {
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service['controlPointLocation'] = ControlPointLocation.middleTop;
        service.drawingCommand(mousePosition);
        expect(service['lowerLimit'].y).toEqual(mousePosition.y);
    });
    it('on drawingCommand drawSelectedForm should be call', () => {
        const spy = spyOn<any>(service, 'drawSelectedForm').and.callThrough();
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service.drawingCommand(mousePosition);
        expect(spy).toHaveBeenCalled();
    });
    it('if drawingCommand drawSelectedForm should be call', () => {
        const spy = spyOn<any>(service, 'drawSelectedForm').and.callThrough();
        const mousePosition: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['onControlPoint'] = true;
        service.drawingCommand(mousePosition);
        expect(spy).toHaveBeenCalled();
    });
    it('if drawingCommand, isPerfect is true, this.dheight becomes dwidth if dheight is smaller dwidth.', () => {
        const spy = spyOn<any>(service, 'perfectShape').and.callThrough();
        const mousePosition: Vec2 = { x: 20, y: 29 };
        service['onControlPoint'] = true;
        service['isPerfect'] = true;
        service.drawingCommand(mousePosition);
        expect(spy).toHaveBeenCalled();
    });
    it('If perfectShape and dheight > dwidth, dheight becomes dwidth', () => {
        service['dheight'] = 10;
        service['dwidth'] = 2;
        service.perfectShape();
        expect(service['dheight']).toEqual(2);
    });
    it('If perfectShape and dwidth > dheight, dwidth becomes dheight', () => {
        service['dheight'] = 2;
        service['dwidth'] = 10;
        service.perfectShape();
        expect(service['dwidth']).toEqual(2);
    });
    it('on polygonalCommand if nClickLine is > 1, the paths should have some points push', () => {
        const expectedResult2 = service['linePath'].length + 1;
        service['nClickLine'] = 2;
        service.polygonalCommand({ x: mouseEvent.offsetX, y: mouseEvent.offsetY }, mouseEvent);

        expect(service['linePath'].length).toEqual(expectedResult2);
    });
    it('OnMouseleave, clearPath is called', () => {
        const clearSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        service.onMouseLeave(mouseEvent);
        expect(clearSpy).toHaveBeenCalled();
    });
    it('onMouseOver, clearPath is called', () => {
        const clearSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        service.onMouseOver(mouseEvent);
        expect(clearSpy).toHaveBeenCalled();
    });
    it('onMouseDown, mouseDown should be true', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeTruthy();
    });
    it('onMouseDown, mouseDown should be true', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeTruthy();
    });

    it('onMouseDown calls polygonalCommand if SelectorType.Polygonal.', () => {
        const spy = spyOn<any>(service, 'polygonalCommand').and.callThrough();
        service['mouseDown'] = false;
        service['selectorType'] = SelectorType.Polygonal;
        service.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it(' onMouseDown, if selected is false or if verifyBoundaries is false, initialPoint should be the same as mousePosition', () => {
        const expectedResult: Vec2 = { x: 50, y: 50 };
        service['lowerLimit'].x = 0;
        service['upperLimit'].x = 0;
        service['lowerLimit'].y = 0;
        service['upperLimit'].y = 0;
        service['selected'] = true;
        service.onMouseDown(mouseEvent);
        expect(service['initialPoint'].x).toEqual(expectedResult.x);
        expect(service['initialPoint'].y).toEqual(expectedResult.y);
        service['selected'] = false;
        service.onMouseDown(mouseEvent);
        expect(service['initialPoint'].x).toEqual(expectedResult.x);
        expect(service['initialPoint'].y).toEqual(expectedResult.y);
    });

    it(' onMouseDown, if Boundaries is false initialize should be call', () => {
        service['lowerLimit'].x = 0;
        service['upperLimit'].x = 0;
        service['lowerLimit'].y = 0;
        service['upperLimit'].y = 0;
        service.mouseDown = true;
        service['selected'] = true;
        service.onMouseDown(mouseEvent);
        expect(initializeSpy).toHaveBeenCalled();
    });

    it('if In selection boundaries, call drawSelectedForm and drawBorder.', () => {
        service['lowerLimit'].x = 0;
        service['upperLimit'].x = 0;
        service['lowerLimit'].y = 0;
        service['upperLimit'].y = 0;
        service.mouseDown = true;
        service['selected'] = true;
        service.onMouseDown(mouseEvent);
        expect(initializeSpy).toHaveBeenCalled();
    });
    it(' onMouseDown, if click == 1 and isArrow is false, initialize should be call', () => {
        const spy = spyOn<any>(service, 'drawSelectedForm').and.callThrough();
        const borderSpy = spyOn<any>(service['selectionDrawingService'], 'drawBorder').and.callThrough();
        mouseEvent = {
            offsetX: 200,
            offsetY: 200,
            button: 0,
        } as MouseEvent;
        service['lowerLimit'].x = 100;
        service['upperLimit'].x = 300;
        service['lowerLimit'].y = 100;
        service['upperLimit'].y = 300;
        service.mouseDown = true;
        service['drawingService'].mouseOnCanvas = true;
        service.selected = true;
        service['selected'] = true;
        service.onMouseDown(mouseEvent);
        expect(service['onControlPoint']).toBeFalse();
        expect(spy).toHaveBeenCalled();
        expect(borderSpy).toHaveBeenCalled();
    });

    it('mouseDown if controlPointVerification returns not none, onControlPoint becomes true.', () => {
        mouseEvent = {
            offsetX: 10,
            offsetY: 10,
            button: 0,
        } as MouseEvent;
        service['lowerLimit'].x = 10;
        service['upperLimit'].x = 20;
        service['lowerLimit'].y = 10;
        service['upperLimit'].y = 20;
        service.mouseDown = true;
        service['drawingService'].mouseOnCanvas = true;
        service.selected = true;
        service['selected'] = true;
        service.onMouseDown(mouseEvent);
        expect(service['onControlPoint']).toBeTrue();
    });

    it(' onMouseMove, if click > 0 and le selector type is polygonal, path[0] should be equal to onMouseCoord', () => {
        service['lowerLimit'].x = 0;
        service['upperLimit'].x = 0;
        service['lowerLimit'].y = 0;
        service['upperLimit'].y = 0;
        service.mouseDownCoord = { x: 5, y: 5 };
        service.selectorType = SelectorType.Polygonal;
        service['nClickLine'] = 1;
        service.onMouseMove(mouseEvent);
        expect(service['pathData'][0]).toEqual(service.mouseDownCoord);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it(' onMouseMove, if isperfect is true and selectortype is polygonal, linedegreefix should be call', () => {
        service['isPerfect'] = true;
        service.selectorType = SelectorType.Polygonal;
        service.mouseDownCoord = { x: 200, y: 200 };
        service['initialPoint'] = { x: 0, y: 0 };
        service['lastPoint'] = { x: 5, y: 5 };
        service['lowerLimit'].x = 0;
        service['upperLimit'].x = 0;
        service['lowerLimit'].y = 0;
        service['upperLimit'].y = 0;
        service['nClickLine'] = 1;
        service.onMouseMove(mouseEvent);
        expect(Math.round(service['lastPoint'].x)).toBe(50);
    });

    it(' onMouseMove, if mouseDown is true, selected = false, call selectionRectangle', () => {
        const spy = spyOn<any>(service, 'selectionRectangle').and.callThrough();
        service['nClickLine'] = 0;
        service['mouseDown'] = true;
        service['drawingService'].mouseOnCanvas = true;
        service['selected'] = false;
        service.selectorType = SelectorType.Rectangle;
        service.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it(' onMouseMove, if mouseDown is true, selected = false, call selectionRectangle', () => {
        const spy = spyOn<any>(service, 'drawingCommand').and.callThrough();
        service['nClickLine'] = 0;
        service['mouseDown'] = true;
        service['drawingService'].mouseOnCanvas = true;
        service['selected'] = true;
        service.selectorType = SelectorType.Rectangle;
        service.onMouseMove(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseUp, we call SelectedRectangle and clearPath', () => {
        const clearSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        const selectedRectangleSpy = spyOn<any>(service, 'selectedRectangle').and.callThrough();
        service.mouseDown = true;
        service['drawingService'].mouseOnCanvas = true;
        service['selected'] = false;
        service['width'] = 1;
        service['height'] = 1;
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
        service['selectorType'] = SelectorType.Rectangle;
        service.onMouseUp(mouseEvent);
        expect(clearSpy).toHaveBeenCalled();
        expect(selectedRectangleSpy).toHaveBeenCalled();
    });
    /*it('onMouseDown, drawBorder should be call if selected is true', () => {
        const spy = spyOn<any>(service.selectionDrawingService, 'drawBorder').and.callThrough();
        service.onMouseDown(mouseEvent);
    });*/

    it('onMouseUp, we call drawBorder is called and drawingCommand', () => {
        const drawingBorderSpy = spyOn<any>(service['selectionDrawingService'], 'drawBorder').and.callThrough();
        const drawCommandSpy = spyOn<any>(service, 'drawingCommand').and.callThrough();
        service.mouseDown = true;
        service['drawingService'].mouseOnCanvas = true;
        service['selected'] = true;
        service['width'] = 1;
        service['height'] = 1;
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
        service['selectorType'] = SelectorType.Rectangle;
        service.onMouseUp(mouseEvent);
        expect(drawCommandSpy).toHaveBeenCalled();
        expect(drawingBorderSpy).toHaveBeenCalled();
    });
    it('DrawSelectedForm calls many functions of ctx when selectorType.Ellipse', () => {
        const saveSpy = spyOn<any>(previewCtxStub, 'save').and.callThrough();
        const beginPathSpy = spyOn<any>(previewCtxStub, 'beginPath').and.callThrough();
        service['selectorType'] = SelectorType.Ellipse;
        const ellipseSpy = spyOn<any>(previewCtxStub, 'ellipse').and.callThrough();
        const clipSpy = spyOn<any>(previewCtxStub, 'clip').and.callThrough();
        service['width'] = 1;
        service['height'] = 1;
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
        service['dwidth'] = -1;
        service['selectorType'] = SelectorType.Ellipse;
        service.drawSelectedForm(previewCtxStub, 10, 10);
        expect(saveSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalled();
        expect(clipSpy).toHaveBeenCalled();
    });

    it('DrawSelectedForm calls many functions of ctx, when selectorType = rectangle.', () => {
        const saveSpy = spyOn<any>(previewCtxStub, 'save').and.callThrough();
        const beginPathSpy = spyOn<any>(previewCtxStub, 'beginPath').and.callThrough();
        const scaleSpy = spyOn<any>(previewCtxStub, 'scale').and.callThrough();
        const drawImageSpy = spyOn<any>(previewCtxStub, 'drawImage').and.callThrough();
        const restoreSpy = spyOn<any>(previewCtxStub, 'restore').and.callThrough();
        service['width'] = 1;
        service['height'] = 1;
        service['scaleXSign'] = 1;
        service['scaleYSign'] = 1;
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
        service['selectorType'] = SelectorType.Rectangle;
        service['dwidth'] = -1;
        service['dheight'] = -1;
        service.drawSelectedForm(previewCtxStub, 10, 10);
        expect(saveSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
        expect(scaleSpy).toHaveBeenCalled();
        expect(service['scaleXSign']).toBe(1);
        expect(service['scaleYSign']).toBe(1);
        expect(drawImageSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });
    it('SelectionRectangle, we call SelectSquare and clearPath', () => {
        const selectionSquareSpy = spyOn<any>(service, 'selectionSquare').and.callThrough();
        const strokeRectSpy = spyOn<any>(previewCtxStub, 'strokeRect').and.callThrough();
        path.push({ x: 10, y: 10 });
        path.push({ x: 5, y: 5 });
        service['width'] = 2;
        service['pathData'].push({ x: 15, y: 15 });
        service['pathData'].push({ x: 20, y: 16 });
        service['isPerfect'] = true;
        service['selectorType'] = SelectorType.Rectangle;
        service['height'] = 2;
        service.selectionRectangle(previewCtxStub, path);
        expect(selectionSquareSpy).toHaveBeenCalled();
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    it('SelectionRectangle, we call ctx.ellipse when selectorType.Ellipse', () => {
        const selectionSquareSpy = spyOn<any>(service, 'selectionSquare').and.callThrough();
        const ellipseSpy = spyOn<any>(previewCtxStub, 'ellipse').and.callThrough();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        path.push({ x: 10, y: 10 });
        path.push({ x: 5, y: 5 });
        service['width'] = 2;
        service['pathData'].push({ x: 15, y: 15 });
        service['pathData'].push({ x: 20, y: 16 });
        service['isPerfect'] = true;
        service['selectorType'] = SelectorType.Ellipse;
        service['height'] = 2;
        service.selectionRectangle(previewCtxStub, path);
        expect(selectionSquareSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });
    it('SelectedRectangle,if selected is false, selcted becomes true and also isArrow becomes false.', () => {
        const drawSelectedForm = spyOn<any>(service, 'drawSelectedForm').and.callThrough();
        const clearFirstTimeSpy = spyOn<any>(service['selectionDrawingService'], 'clearFirstTime').and.callThrough();
        const limitAssignationSpy = spyOn<any>(service['limitAssignService'], 'limitAssignation').and.callThrough();
        const drawImageSpy = spyOn<any>(service['imageCtx'], 'drawImage').and.callThrough();
        const drawBorderSpy = spyOn<any>(service['selectionDrawingService'], 'drawBorder').and.callThrough();
        path.push({ x: 10, y: 10 });
        path.push({ x: 5, y: 5 });
        service['width'] = 2;
        service['selected'] = false;
        service['isPerfect'] = true;
        service['selectorType'] = SelectorType.Ellipse;
        service['height'] = 2;
        service.selectedRectangle(previewCtxStub, path);
        expect(service['selected']).toBeTrue();
        expect(limitAssignationSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(drawBorderSpy).toHaveBeenCalled();
        expect(clearFirstTimeSpy).toHaveBeenCalled();
        expect(drawSelectedForm).toHaveBeenCalled();
    });

    it('SelectedRectangle,if selected is true, and selector.type = All, call ClearPath.', () => {
        const limitAssignationSpy = spyOn<any>(service['limitAssignService'], 'limitAssignation').and.callThrough();
        path.push({ x: 10, y: 10 });
        path.push({ x: 5, y: 5 });
        service['width'] = 2;
        service['selected'] = true;
        service['isPerfect'] = true;
        service['selectorType'] = SelectorType.All;
        service['height'] = 2;
        service.selectedRectangle(previewCtxStub, path);
        expect(limitAssignationSpy).toHaveBeenCalled();
    });

    it('on SelectionSquare, dwidth is equal to height if height is ssmaller than width..', () => {
        path.push({ x: 5, y: 5 });
        service['width'] = 2;
        service['height'] = 1;
        service.selectionSquare();
        expect(service['dwidth']).toBe(1);
    });

    it('OnKeyUp,if we let go of shiftKey and MouseDown is true, call selectionRectangle.', () => {
        const shiftKeyEventUp = { shiftKey: false } as KeyboardEvent;
        const selectionRectangleSpy = spyOn<any>(service, 'selectionRectangle').and.callThrough();
        const arrowKeyAssignationSpy = spyOn<any>(service['keyDisplacementService'], 'arrowKeyAssignation').and.callThrough();
        service['isPerfect'] = true;
        service['mouseDown'] = true;
        service['pathData'].push({ x: 10, y: 10 });
        service['pathData'].push({ x: 5, y: 5 });
        service['selectorType'] = SelectorType.Rectangle;
        service.onKeyUp(shiftKeyEventUp);
        expect(selectionRectangleSpy).toHaveBeenCalled();
        expect(arrowKeyAssignationSpy).toHaveBeenCalled();
        expect(service['isPerfect']).toBeFalse();
    });
    it('OnKeyUp,if we let go of shiftKey and MouseDown is false, call selectiedRectangle.', () => {
        const shiftKeyEventUp = { shiftKey: false } as KeyboardEvent;
        const selectedRectangleSpy = spyOn<any>(service, 'selectedRectangle').and.callThrough();
        service['isPerfect'] = true;
        service.mouseDown = false;
        service['width'] = 1;
        service['height'] = 1;
        service['pathData'].push({ x: 10, y: 10 });
        service['pathData'].push({ x: 5, y: 5 });
        service['selectorType'] = SelectorType.Rectangle;
        service.onKeyUp(shiftKeyEventUp);
        expect(selectedRectangleSpy).toHaveBeenCalled();
    });
    it('OnKeyUp,if we let go of Escape, call selectedRectangle.', () => {
        const escEventUp = { key: 'Escape' } as KeyboardEvent;
        service['isPerfect'] = true;
        service.mouseDown = false;
        service['selected'] = true;
        service['width'] = 1;
        service['height'] = 1;
        service['nClickLine'] = 2;
        service['pathData'].push({ x: 10, y: 10 });
        service['pathData'].push({ x: 5, y: 5 });
        service['selectorType'] = SelectorType.Polygonal;
        service.onKeyUp(escEventUp);
        expect(service['nClickLine']).toBe(0);
    });

    it('OnKeyUp,if we let go of Escape,if selectorType ont polygonal, selected is false', () => {
        const escEventUp = { key: 'Escape' } as KeyboardEvent;
        service.mouseDown = false;
        service['selected'] = false;
        service['width'] = 1;
        service['height'] = 1;
        service['nClickLine'] = 2;
        service['pathData'].push({ x: 10, y: 10 });
        service['pathData'].push({ x: 5, y: 5 });
        service['selectorType'] = SelectorType.Rectangle;
        service.onKeyUp(escEventUp);
        expect(service.selected).toBeFalse();
    });

    it('OnKeyUp,if we let go of Backscape, call selectorType.Polygonal.', () => {
        const backEventUp = { key: 'Backspace' } as KeyboardEvent;
        const polygonalServiceSpy = spyOn<any>(service['polygonalService'], 'drawSelectedLine').and.callThrough();
        const arrowKeyAssignationSpy = spyOn<any>(service['keyDisplacementService'], 'arrowKeyAssignation').and.callThrough();
        service['isPerfect'] = true;
        service['mouseDown'] = false;
        service['selected'] = true;
        service['width'] = 1;
        service['height'] = 1;
        service['nClickLine'] = 2;
        service['pathData'].push({ x: 10, y: 10 });
        service['pathData'].push({ x: 5, y: 5 });
        service['selectorType'] = SelectorType.Polygonal;
        service.onKeyUp(backEventUp);
        expect(arrowKeyAssignationSpy).toHaveBeenCalled();
        expect(polygonalServiceSpy).toHaveBeenCalled();
    });

    it('OnKeyUp,if we let go of Backscape, call selectorType.Polygonal.', () => {
        const keyEventUp = { key: 'v', ctrlKey: false } as KeyboardEvent;

        service.onKeyUp(keyEventUp);
        expect(service['keyHandlerService'].isShortcutActive).toBeTrue();
    });
    it('on ArrowInit makes timer100Disabled false.', () => {
        service['timer100Disabled'] = true;
        service.arrowInit(20, 20);
        expect(service['timer100Disabled']).toBeFalse();
    });

    it('on ArrowInit, if canMove is true, drawSelectedForm is called.', () => {
        const drawSelectedFormSpy = spyOn<any>(service, 'drawSelectedForm').and.callThrough();
        service['canMove'] = true;
        service['timer100Disabled'] = false;
        service.arrowInit(20, 20);
        expect(drawSelectedFormSpy).toHaveBeenCalled();
    });

    it('ArrowLogic calls arrowInit.', () => {
        const arrowInitSpy = spyOn<any>(service, 'arrowInit').and.callThrough();
        service.arrowLogic();
        expect(arrowInitSpy).toHaveBeenCalled();
    });
    it('OnKeyDown for shiftkey, canMove true calls arrowLogic, and calls shiftedDrawing.', () => {
        const shiftKeyEventDown = { shiftKey: true } as KeyboardEvent;
        service['timerDisabled'] = false;
        service['canMove'] = true;
        const arrowLogicSpy = spyOn<any>(service, 'arrowLogic').and.callThrough();
        const shiftDrawingSpy = spyOn<any>(service, 'shiftedDrawing').and.callThrough();

        service.onKeyDown(shiftKeyEventDown);
        expect(arrowLogicSpy).toHaveBeenCalled();
        expect(shiftDrawingSpy).toHaveBeenCalled();
    });
    it('OnKeyDown turns timerDisabled to false.', () => {
        const shiftKeyEventDown = { shiftKey: true } as KeyboardEvent;
        service['timerDisabled'] = true;
        service['canMove'] = false;

        service.onKeyDown(shiftKeyEventDown);
        expect(service['timerDisabled']).toBeFalse();
    });
    it('On shiftedDrawing, if mouseDown is true, selectionRectangle is called.', () => {
        service['mouseDown'] = true;
        service['onControlPoint'] = false;
        const selectionRectangleSpy = spyOn<any>(service, 'selectionRectangle').and.callThrough();
        service.shiftedDrawing();
        expect(selectionRectangleSpy).toHaveBeenCalled();
    });

    it('On shiftedDrawing, if mouseDown is false, selectedRectangle is called.', () => {
        service['mouseDown'] = false;
        service['onControlPoint'] = false;
        const selectedRectangleSpy = spyOn<any>(service, 'selectedRectangle').and.callThrough();
        service.shiftedDrawing();
        expect(selectedRectangleSpy).toHaveBeenCalled();
    });
    it('On copied, drawSelectedForm is called, drawBorder is called.', () => {
        const selectedFormSpy = spyOn<any>(service, 'drawSelectedForm').and.callThrough();
        const drawBorderSpy = spyOn<any>(service['selectionDrawingService'], 'drawBorder').and.callThrough();
        service['selected'] = true;
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        service.copied();
        expect(selectedFormSpy).toHaveBeenCalled();
        expect(drawBorderSpy).toHaveBeenCalled();
    });
    it('on cut, call copied and delete.', () => {
        const copiedSpy = spyOn<any>(service, 'copied').and.callThrough();
        const deleteSpy = spyOn<any>(service, 'delete').and.callThrough();
        service.cut();
        expect(copiedSpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });
    it('on paste, putImageData is called.', () => {
        const putImageDataSpy = spyOn<any>(baseCtxStub, 'putImageData').and.callThrough();
        service.isCopied = true;
        service.paste();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('on delete, call fillRect', () => {
        const fillRectSpy = spyOn<any>(baseCtxStub, 'fillRect').and.callThrough();
        // const deleteSpy = spyOn<any>(service, 'delete').and.callThrough();
        service.selected = true;
        service.delete();
        expect(fillRectSpy).toHaveBeenCalled();
    });
    const createMockKeyboardEvent = (keyPress: string): KeyboardEvent => {
        // tslint:disable-next-line: no-empty
        return { key: keyPress, preventDefault: () => {}, stopPropagation: () => {} } as KeyboardEvent;
    };
    it('r should change selectorType to Rectangle', () => {
        const keydown = createMockKeyboardEvent('r');
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(service.selectorType).toEqual(SelectorType.Rectangle);
    });

    it('s should change selectorType to Ellipse', () => {
        const keydown = createMockKeyboardEvent('s');
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(service.selectorType).toEqual(SelectorType.Ellipse);
    });

    it('v should change selectorType to Polygonal', () => {
        const keydown = createMockKeyboardEvent('v');
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(service.selectorType).toEqual(SelectorType.Polygonal);
    });

    it('ctrl a should change selectorType to All', () => {
        const keydown = createMockKeyboardEvent('control');
        const keydown2 = createMockKeyboardEvent('a');
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        service['keyHandlerService'].onKeyDown(keydown2);
        expect(service.selectorType).toEqual(SelectorType.All);
    });

    it('ctrl v should call paste.', () => {
        const keydown = createMockKeyboardEvent('control');
        const keydown2 = createMockKeyboardEvent('v');
        const pasteSpy = spyOn<any>(service, 'paste').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        service['keyHandlerService'].onKeyDown(keydown2);
        expect(pasteSpy).toHaveBeenCalled();
    });

    it('ctrl x should call cut.', () => {
        const keydown = createMockKeyboardEvent('control');
        const keydown2 = createMockKeyboardEvent('x');
        const cutSpy = spyOn<any>(service, 'cut').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        service['keyHandlerService'].onKeyDown(keydown2);
        expect(cutSpy).toHaveBeenCalled();
    });
    it('on selectedRectangle, call limitAssignation.', () => {
        const limitSpy = spyOn<any>(service['limitAssignService'], 'limitAssignation').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        service.selected = true;
        service.selectorType = SelectorType.Polygonal;
        // tslint:disable-next-line: no-string-literal
        service.selectedRectangle(previewCtxStub, path);
        expect(limitSpy).toHaveBeenCalled();
    });

    it('Right arrow should call drawWithArrow', () => {
        service['isMagnetisme'] = true;
        const keydown = createMockKeyboardEvent('ArrowRight');

        const spy = spyOn(service, 'drawWithArrow').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });

    it('Left arrow should call drawWithArrow', () => {
        const keydown = createMockKeyboardEvent('ArrowLeft');

        const spy = spyOn(service, 'drawWithArrow').and.callThrough();
        service['isMagnetisme'] = true;
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });

    it('Up arrow should call drawWithArrow', () => {
        const keydown = createMockKeyboardEvent('ArrowUp');
        service['isMagnetisme'] = true;
        const spy = spyOn(service, 'drawWithArrow').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });

    it('Down arrow should call drawWithArrow', () => {
        service['isMagnetisme'] = true;
        const keydown = createMockKeyboardEvent('ArrowDown');

        const spy = spyOn(service, 'drawWithArrow').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });

    it('DrawWithArrow should call clear Canvas, clearFirstTime, adaptedAssignationMagnetismeArrow, drawSelectedForm and drawBorder', () => {
        const spyAdaptedAssignationMagetismeArrow = spyOn(service['limitAssignService'], 'adaptedAssignationMagetismeArrow');
        const spyDrawSelectedForm = spyOn(service, 'drawSelectedForm');
        const spydrawBorder = spyOn(service['selectionDrawingService'], 'drawBorder');

        const gridSize = 0;
        const arrowDirection = ' ';

        service.drawWithArrow(gridSize, arrowDirection);
        expect(spyAdaptedAssignationMagetismeArrow).toHaveBeenCalled();
        expect(spyDrawSelectedForm).toHaveBeenCalled();
        expect(spydrawBorder).toHaveBeenCalled();
    });

    it('onGridSelection should ajuste the lowerlimit to the grid to the left according to the grid square dimension', () => {
        const lowerLimit = { x: 1, y: 1 };
        service.onGridSelection(lowerLimit);
        expect(lowerLimit.x).toEqual(0);
        expect(lowerLimit.y).toEqual(0);
    });

    it('onGridSelection should ajuste the lowerlimit to the grid to the right according to the grid square dimension', () => {
        const lowerLimit = { x: 16, y: 16 };
        service.onGridSelection(lowerLimit);
        expect(lowerLimit.x).toEqual(30);
        expect(lowerLimit.y).toEqual(30);
    });

    it('positionSelectionMagnetism call onGridSelection to should ajuste the lowerlimit to the grid to the right according to the grid square dimension', () => {
        service['isMagnetisme'] = true;
        service['onControlPoint'] = true;
        const mousePosition = { x: 0, y: 0 };

        const spyOnGridSelection = spyOn(service, 'onGridSelection');
        service.positionSelectionMagnetism(mousePosition);
        expect(spyOnGridSelection).toHaveBeenCalled();
    });

    it('DrawCommand calls adaptedAssignationMagetisme and drawSelectedForm.', () => {
        service['isMagnetisme'] = true;
        service['onControlPoint'] = false;
        const mousePosition = { x: 0, y: 0 };

        const spyLimit = spyOn(service['limitAssignService'], 'adaptedAssignationMagetisme');
        service.drawingCommand(mousePosition);
        expect(spyLimit).toHaveBeenCalled();
    });
});
