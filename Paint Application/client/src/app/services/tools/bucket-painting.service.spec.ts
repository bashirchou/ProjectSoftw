import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { leftMouseClick, maxColorValue, pixelLenght, rightMouseClick } from '@app/classes/constant';
import { Point } from '@app/classes/point';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BucketPaintingService } from './bucket-painting.service';
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
describe('BucketPaintingService', () => {
    let service: BucketPaintingService;
    const drawingServiceMock = new DrawingServiceMock();

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawingServiceMock }] });
        service = TestBed.inject(BucketPaintingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true if 2 color are the same', () => {
        service.colorTolerance = 0;
        // tslint:disable: no-string-literal
        service['clickedColor'] = [0, 0, 0];
        const canvasData = new Uint8ClampedArray([0, 0, 0, 1]);
        const imageData = new ImageData(canvasData, 1, 1);
        expect(service.isSameColor(new Point(0, 0), imageData)).toBeTrue();
    });
    it('should return true if 2 color are not the same', () => {
        service.colorTolerance = 0;
        service['clickedColor'] = [0, 0, 1];
        const canvasData = new Uint8ClampedArray([0, 0, 0, 1]);
        const imageData = new ImageData(canvasData, 1, 1);
        expect(service.isSameColor(new Point(0, 0), imageData)).toBeFalse();
    });
    it('should return true if 2 color are not similar', () => {
        service.colorTolerance = 0;
        service['clickedColor'] = [0, 0, 1];
        const canvasData = new Uint8ClampedArray([0, 0, 0, 1]);
        const imageData = new ImageData(canvasData, 1, 1);
        expect(service.isSameColor(new Point(0, 0), imageData)).toBeFalse();
    });

    it('should return true if 2 color are similar', () => {
        const maxTolerance = 100;
        service.colorTolerance = maxTolerance;
        service['clickedColor'] = [0, 0, 1];
        const canvasData = new Uint8ClampedArray([maxColorValue, maxColorValue, maxColorValue, 1]);
        const imageData = new ImageData(canvasData, 1, 1);
        expect(service.isSameColor(new Point(0, 0), imageData)).toBeTrue();
    });
    it('should return false if 2 color are not similar', () => {
        const maxTolerance = 1;
        service.colorTolerance = maxTolerance;
        service['clickedColor'] = [0, 0, 1];
        const canvasData = new Uint8ClampedArray([maxColorValue, maxColorValue, maxColorValue, 1]);
        const imageData = new ImageData(canvasData, 1, 1);
        expect(service.isSameColor(new Point(0, 0), imageData)).toBeFalse();
    });

    it('should return a array of number for a primary color', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].primaryColor = 'rgba(0,0,0,1)';
        expect(service.getColorArray()).toEqual(['0', '0', '0', '' + maxColorValue]);
    });
    it('should return a array of number for a primary color', () => {
        // tslint:disable-next-line: no-string-literal
        const ds = service['drawingService'];
        ds.primaryColor = 'rgba(0,0,2,0)';
        ds.baseCtx.beginPath();
        ds.baseCtx.rect(0, 0, 1, 1);
        ds.baseCtx.fillStyle = ds.primaryColor;
        ds.baseCtx.fill();
        const imageData = ds.baseCtx.getImageData(0, 0, ds.canvas.width, ds.canvas.height);
        service.changeColor(new Point(0, 0), imageData);
        expect(imageData.data[2]).toEqual(2);
    });

    it('should change the color', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].primaryColor = 'rgba(0,0,2,0)';

        expect(service.getColorArray()).toEqual(['0', '0', '2', '0']);
    });

    it('should change all red pixel to blue', () => {
        // tslint:disable-next-line: no-string-literal
        const ds = service['drawingService'];
        const imageData = ds.baseCtx.getImageData(0, 0, ds.canvas.width, ds.canvas.height);
        const point = new Point(0, 0);
        const index = (point.x + point.y * ds.canvas.width) * pixelLenght;

        imageData.data[0] = maxColorValue;
        imageData.data[1] = maxColorValue;
        imageData.data[2] = maxColorValue;
        imageData.data[pixelLenght - 1] = maxColorValue;

        imageData.data[index] = maxColorValue;
        imageData.data[index + 1] = maxColorValue;
        imageData.data[index + 2] = maxColorValue;
        imageData.data[index + pixelLenght - 1] = maxColorValue;

        ds.baseCtx.putImageData(imageData, 0, 0);
        service['clickedColor'] = [maxColorValue, maxColorValue, maxColorValue];
        ds.primaryColor = 'rgba(0,255,0,1)';
        service.colorTolerance = 1;
        service.noContiguousPixel();

        const imageDataFinal = ds.baseCtx.getImageData(0, 0, ds.canvas.width, ds.canvas.height);
        expect(imageDataFinal.data[0]).toEqual(0);
        expect(imageDataFinal.data[1]).toEqual(maxColorValue);
        expect(imageDataFinal.data[index]).toEqual(0);
        expect(imageDataFinal.data[index + 1]).toEqual(maxColorValue);
    });

    it('should calculate the distance between 2 points', () => {
        const color1 = [0, maxColorValue, 0];
        const color2 = [maxColorValue, 0, 0];
        expect(service.calculateDistanceBetweenColor(color1, color2)).toBeGreaterThan(0);
        const color3 = [maxColorValue, maxColorValue, 1];
        const color4 = [maxColorValue, maxColorValue, 0];
        expect(service.calculateDistanceBetweenColor(color3, color4)).toBeGreaterThan(0);
        expect(service.calculateDistanceBetweenColor(color3, color3)).toBe(0);
        expect(service.calculateDistanceBetweenColor([0, 0, 0], [maxColorValue, maxColorValue, maxColorValue])).toBe(1);
    });

    it('should change the color of contigous pixel', () => {
        // tslint:disable-next-line: no-string-literal
        const ds = service['drawingService'];
        ds.primaryColor = 'rgba(255,0,0,1)';
        ds.baseCtx.beginPath();
        // tslint:disable-next-line: no-magic-numbers
        ds.baseCtx.rect(1, 1, 3, 3);
        ds.baseCtx.lineWidth = 1;
        ds.baseCtx.fillStyle = ds.primaryColor;
        ds.baseCtx.fill();
        const imageData = ds.baseCtx.getImageData(0, 0, ds.canvas.width, ds.canvas.height);
        const startPoint = new Point(2, 2);
        const index = (startPoint.x + startPoint.y * ds.canvas.width) * pixelLenght;
        service['clickedColor'] = [imageData.data[index], imageData.data[index + 1], imageData.data[index + 2]];
        service.contiguousPixel(startPoint);
        const imageDataFinal = ds.baseCtx.getImageData(0, 0, ds.canvas.width, ds.canvas.height);
        expect(imageDataFinal.data[index]).toBe(maxColorValue);
        expect(imageDataFinal.data[index + 1]).toBe(0);
        expect(imageDataFinal.data[index + 2]).toBe(0);
    });

    it('should change the clickedColor', () => {
        const clickedPoint = new Point(0, 0);
        // tslint:disable-next-line: no-string-literal
        const pixel = service['drawingService'].baseCtx.getImageData(clickedPoint.x, clickedPoint.y, 1, 1).data;
        service.setClickedColor(clickedPoint);
        expect(service['clickedColor']).toEqual([pixel[0], pixel[1], pixel[2]]);
    });

    it('should call the contigious pixel when there is a leftMouseClick', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        // tslint:disable-next-line: no-empty
        const event = { offsetX: 0, offsetY: 1, button: leftMouseClick, preventDefault: () => {} } as MouseEvent;
        // tslint:disable-next-line: no-empty
        const spy = spyOn(service, 'contiguousPixel').and.callFake(() => {});
        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the no-contigious pixel when there is a rightMouseClick', () => {
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].mouseOnCanvas = true;
        // tslint:disable-next-line: no-empty
        const event = { offsetX: 0, offsetY: 1, button: rightMouseClick, preventDefault: () => {} } as MouseEvent;
        // tslint:disable-next-line: no-empty
        const spy = spyOn(service, 'noContiguousPixel').and.callFake(() => {});
        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
    });
});
