import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { maxColorValue, pixelLenght } from '@app/classes/constant';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from './grid.service';

class DrawingServiceMock {
    canvas: HTMLCanvasElement = new CanvasTestHelper().canvas;
    resizePreviewCtx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    drawControlPoints(): void {
        return;
    }
}
const createMockKeyboardEvent = (keyPress: string): KeyboardEvent => {
    // tslint:disable-next-line: no-empty
    return { key: keyPress, preventDefault: () => {}, stopPropagation: () => {} } as KeyboardEvent;
};
describe('GridService', () => {
    let service: GridService;
    let drawingServiceMock: DrawingServiceMock;
    beforeEach(() => {
        drawingServiceMock = new DrawingServiceMock();
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawingServiceMock }] });
        service = TestBed.inject(GridService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add 5 px for the square dimension', () => {
        const squareDimensionPixel = 15;
        service.squareDimensionPixel = squareDimensionPixel;
        service.shortcutAdd();
        // tslint:disable-next-line: no-string-literal
        expect(service.squareDimensionPixel).toBe(squareDimensionPixel + service['keyboardIncrement']);
    });

    it('should remove 5 px for the square dimension', () => {
        const squareDimensionPixel = 15;
        service.squareDimensionPixel = squareDimensionPixel;
        service.shortcutRemove();
        // tslint:disable-next-line: no-string-literal
        expect(service.squareDimensionPixel).toBe(squareDimensionPixel - service['keyboardIncrement']);
    });
    it('should put the minimum for the square dimension if the -5 is smaller than the min square size', () => {
        const squareDimensionPixel = service.minSquareDimensionPixel + 1;
        service.squareDimensionPixel = squareDimensionPixel;
        service.shortcutRemove();
        expect(service.squareDimensionPixel).toBe(service.minSquareDimensionPixel);
    });

    it('should put the max for the square dimension if the +5 is bigger than the max square size', () => {
        const squareDimensionPixel = service.maxSquareDimensionPixel - 1;
        service.squareDimensionPixel = squareDimensionPixel;
        service.shortcutAdd();
        expect(service.squareDimensionPixel).toBe(service.maxSquareDimensionPixel);
    });

    it('should not draw the grid if it is disable', () => {
        // tslint:disable-next-line: no-string-literal
        const ctx = service['drawingService'].resizePreviewCtx;
        const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
        service.isGridDraw = false;
        service.drawGrid();
        // tslint:disable-next-line: no-string-literal
        const resultCtx = service['drawingService'].resizePreviewCtx;
        const resultData = resultCtx.getImageData(0, 0, resultCtx.canvas.width, resultCtx.canvas.height).data;
        expect(data).toEqual(resultData);
    });

    it('should draw the grid if it is activated', () => {
        // tslint:disable-next-line: no-string-literal
        const ctx = service['drawingService'].resizePreviewCtx;
        const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
        service.isGridDraw = true;
        service.drawGrid();
        // tslint:disable-next-line: no-string-literal
        const resultCtx = service['drawingService'].resizePreviewCtx;
        const resultData = resultCtx.getImageData(0, 0, resultCtx.canvas.width, resultCtx.canvas.height).data;
        expect(data).not.toEqual(resultData);
        expect(data[0]).not.toEqual(maxColorValue);
        expect(data[0 + pixelLenght * service.squareDimensionPixel]).not.toEqual(maxColorValue);
    });

    it('Reset should clear and redraw de previewCanvas with the grid', () => {
        // tslint:disable-next-line: no-string-literal
        const ctx = service['drawingService'].resizePreviewCtx;
        const spyCanvas = spyOn(ctx, 'clearRect').and.callFake(() => {
            return;
        });
        const spyDraw = spyOn(service, 'drawGrid').and.callFake(() => {
            return;
        });
        // tslint:disable-next-line: no-string-literal
        const spyControlPoints = spyOn(service['drawingService'], 'drawControlPoints').and.callFake(() => {
            return;
        });
        service.reset();
        expect(spyCanvas).toHaveBeenCalled();
        expect(spyDraw).toHaveBeenCalled();
        expect(spyControlPoints).toHaveBeenCalled();
    });

    it('Should change the grid value and call reset', () => {
        const spyReset = spyOn(service, 'reset').and.callFake(() => {
            return;
        });

        // tslint:disable-next-line: no-string-literal
        service['gridDraw'] = false;
        service.isGridDraw = true;
        expect(spyReset).toHaveBeenCalled();
        // tslint:disable-next-line: no-string-literal
        expect(service['gridDraw']).toBeTrue();
    });

    it('Should change the grid opacity and call reset', () => {
        const spyReset = spyOn(service, 'reset').and.callFake(() => {
            return;
        });

        // tslint:disable-next-line: no-string-literal
        service['gridOpacity'] = 1;
        service.squareOpacity = 2;
        expect(spyReset).toHaveBeenCalled();
        // tslint:disable-next-line: no-string-literal
        expect(service['gridOpacity']).toBe(2);
    });

    it('Should change the grid size and call reset', () => {
        const spyReset = spyOn(service, 'reset').and.callFake(() => {
            return;
        });

        // tslint:disable-next-line: no-string-literal
        service['squareDimensionPixelInternal'] = 1;
        service.squareDimensionPixel = 2;
        expect(spyReset).toHaveBeenCalled();
        // tslint:disable-next-line: no-string-literal
        expect(service['squareDimensionPixelInternal']).toBe(2);
    });

    it('Should return if the grid is beeing draw', () => {
        // tslint:disable-next-line: no-string-literal
        service['gridDraw'] = false;
        expect(service.isGridDraw).toBeFalse();
    });

    it('Should return the square opacity', () => {
        // tslint:disable-next-line: no-string-literal
        service['gridOpacity'] = 1;
        expect(service.squareOpacity).toBe(1);
    });

    it('Should return the squareDimensionPixel', () => {
        // tslint:disable-next-line: no-string-literal
        service['squareDimensionPixelInternal'] = 1;
        expect(service.squareDimensionPixel).toBe(1);
    });

    it('G should change the grid state', () => {
        // tslint:disable-next-line: no-string-literal
        service['gridDraw'] = false;
        const keydown = createMockKeyboardEvent('g');
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        // tslint:disable-next-line: no-string-literal
        expect(service['gridDraw']).toBeTrue();
    });

    it('+ should change squareSize', () => {
        // tslint:disable-next-line: no-string-literal
        service['squareDimensionPixelInternal'] = service.minSquareDimensionPixel;

        const keydown = createMockKeyboardEvent('+');

        const spy = spyOn(service, 'shortcutAdd').and.callFake(() => {
            return;
        });
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });

    it('= should change squareSize', () => {
        // tslint:disable-next-line: no-string-literal
        service['squareDimensionPixelInternal'] = service.minSquareDimensionPixel;

        const keydown = createMockKeyboardEvent('=');

        const spy = spyOn(service, 'shortcutAdd').and.callFake(() => {
            return;
        });
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });

    it('- should change squareSize', () => {
        // tslint:disable-next-line: no-string-literal
        service['squareDimensionPixelInternal'] = service.minSquareDimensionPixel;

        const keydown = createMockKeyboardEvent('-');

        const spy = spyOn(service, 'shortcutRemove').and.callFake(() => {
            return;
        });
        // tslint:disable-next-line: no-string-literal
        service['keyHandlerService'].onKeyDown(keydown);
        expect(spy).toHaveBeenCalled();
    });
});
