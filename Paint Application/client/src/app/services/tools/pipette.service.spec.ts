import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PipetteService } from './pipette.service';

class DrawingServiceMock {
    canvas: HTMLCanvasElement = new CanvasTestHelper().canvas;
    baseCtx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    isPointsOnCanvas(x: number, y: number): boolean {
        return x <= this.canvas.width && x >= 0 && y <= this.canvas.height && y >= 0;
    }
    getPixelColor(): string {
        return '#ffffff';
    }
}
describe('PipetteService', () => {
    let service: PipetteService;
    let canvasTestHelper: CanvasTestHelper;
    const drawingServiceMock = new DrawingServiceMock();
    const maxPixelValue = 255;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceMock }],
        });
        service = TestBed.inject(PipetteService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.zoomCanvas = canvasTestHelper.canvas;
        service.zoomCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('When the mouse leave the canvas it should react to it', () => {
        // tslint:disable-next-line: no-empty
        const createEmptyCercleDrawZoneSpy = spyOn(service, 'createEmptyCircleDrawZone').and.callFake(() => {});
        service.onMouseLeave({} as MouseEvent);
        expect(createEmptyCercleDrawZoneSpy).toHaveBeenCalled();
    });

    it('When the mouse move it should update the mouse position', () => {
        service.onMouseMove({ offsetX: 0, offsetY: 0 } as MouseEvent);
        expect(service.currentX).toBe(0);
        expect(service.currentY).toBe(0);
    });

    it('When the mouse move in the canvas it should draw the zoomedCanvas', () => {
        service.disableDraw = false;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        // tslint:disable-next-line: no-empty
        const spy = spyOn(service, 'calculateZoomedPixel').and.callFake(() => {});
        service.onMouseMove({ offsetX: 0, offsetY: 0 } as MouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it('When the mouse move while in the canvas it should draw a empty zoomedCanvas', () => {
        service.disableDraw = false;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = false;
        // tslint:disable-next-line: no-empty
        const spy = spyOn(service, 'createEmptyCircleDrawZone').and.callFake(() => {});
        service.onMouseMove({ offsetX: 0, offsetY: 0 } as MouseEvent);
        expect(spy).toHaveBeenCalled();
    });
    it('createEmptyCircleDrawZone should create a empty circle zone', () => {
        service.createEmptyCircleDrawZone();
        expect(service.zoomCtx.fillStyle).toBe('#ffffff');
        service.zoomCtx.fillStyle = 'black';
        service.zoomCtx.fillRect(0, 0, service.zoomCanvas.width, service.zoomCanvas.height);
        const pixelOutsideCircle = service.zoomCtx.getImageData(0, 0, 1, 1).data;
        // tslint:disable-next-line: no-magic-numbers
        expect(pixelOutsideCircle[3]).toBe(0); // alpha pixel that is not in the circle should be transparent
        const pixelInCircle = service.zoomCtx.getImageData(service.zoomCanvas.width / 2, service.zoomCanvas.height / 2, 1, 1).data;
        // tslint:disable-next-line: no-magic-numbers
        expect(pixelInCircle[3]).toBe(maxPixelValue);
        // the pixel in the arc should be opaque
    });

    it('createCercleForMiddlePixel should create a circle in the middle zoom canvas', () => {
        service.createCercleForMiddlePixel();
        // tslint:disable-next-line: no-string-literal
        const pixel = service.zoomCtx.getImageData(service['pixelCenterDiameter'] + service.zoomCanvas.width / 2, service.zoomCanvas.height / 2, 1, 1)
            .data;
        // tslint:disable-next-line: no-magic-numbers
        expect(pixel[3] !== 0).toBeTrue(); // the pixel should not be tranparent (it is on the circle)
    });

    it('drawZoomedImage should draw the zoom image around the mouse', () => {
        service.currentX = 0;
        service.currentY = 0;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].baseCtx.fillStyle = '#ffffff';
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].baseCtx.fillRect(0, 0, 1, 1);
        service.disableDraw = false;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        service.drawZoomedImage();
        const pixelMiddle = service.zoomCtx.getImageData(service.zoomCanvas.width / 2, service.zoomCanvas.height / 2, 1, 1).data;
        expect(pixelMiddle[0]).toBe(maxPixelValue);
        expect(pixelMiddle[1]).toBe(maxPixelValue);
        expect(pixelMiddle[2]).toBe(maxPixelValue);
        // tslint:disable-next-line: no-magic-numbers
        expect(pixelMiddle[3]).toBe(maxPixelValue);
    });
    it('When the mouse enter the canvas it should enable draw', () => {
        service.disableDraw = true;
        service.onMouseOver({} as MouseEvent);
        expect(service.disableDraw).toBeFalse();
    });

    it('When the mouse is not on the canvas the onMouseDown should do nothing', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = false;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].primaryColor = '#dddddd';
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].secondaryColor = '#dddddd';
        service.onMouseDown({
            offsetX: 0,
            offsetY: 0,
            preventDefault: () => {
                // emptry
            },
        } as MouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].primaryColor).toBe('#dddddd');
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].secondaryColor).toBe('#dddddd');
    });

    it('A left click on the mouse on canvas should change primary color', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].primaryColor = '#dddddd';
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].secondaryColor = '#dddddd';
        service.onMouseDown({
            offsetX: 0,
            offsetY: 0,
            preventDefault: () => {
                // emptry
            },
            button: 0,
        } as MouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].primaryColor).toBe('#ffffff');
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].secondaryColor).toBe('#dddddd');
    });

    it('A right click on the mouse on canvas should change primary color', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].primaryColor = '#dddddd';
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].secondaryColor = '#dddddd';
        service.onMouseDown({
            offsetX: 0,
            offsetY: 0,
            preventDefault: () => {
                // emptry
            },
            button: 2,
        } as MouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].primaryColor).toBe('#dddddd');
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].secondaryColor).toBe('#ffffff');
    });
    it('A other click on the mouse on canvas should do nothing', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].primaryColor = '#dddddd';
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].secondaryColor = '#dddddd';
        service.onMouseDown({
            offsetX: 0,
            offsetY: 0,
            preventDefault: () => {
                // emptry
            },
            button: -1,
        } as MouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].primaryColor).toBe('#dddddd');
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].secondaryColor).toBe('#dddddd');
    });
});
