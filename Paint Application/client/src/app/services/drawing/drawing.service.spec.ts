import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { maxColorValue, MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH, ShapeType } from '@app/classes/constant';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.resizePreviewCtx = canvasTestHelper.resizePreviewCtx.getContext('2d') as CanvasRenderingContext2D;
    });
    it('The drawPoint should draw a point', () => {
        const x = 1;
        const y = 1;
        // tslint:disable-next-line: no-string-literal
        service['drawPoint'](x, y);
        const width = service.resizePreviewCtx.canvas.width;
        const height = service.resizePreviewCtx.canvas.height;
        const pixel = service.resizePreviewCtx.getImageData(0, 0, width, height);
        // tslint:disable-next-line: no-magic-numbers
        const idx = (y * width + x) * 4;
        expect(pixel.data[idx]).toBe(0);
        expect(pixel.data[idx + 1]).toBe(0);
        expect(pixel.data[idx + 1]).toBe(0);
        // tslint:disable-next-line: no-magic-numbers
        expect(pixel.data[idx + 3]).toBe(255);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('should change the colors', () => {
        const blue = '#0000ff';
        const red = '#ff0000';
        service.changeColor(blue, red);
        expect(service.primaryColor).toEqual(blue);
        expect(service.secondaryColor).toEqual(red);
        expect(service.baseCtx.fillStyle).toEqual(blue);
        expect(service.previewCtx.fillStyle).toEqual(blue);
        expect(service.baseCtx.strokeStyle).toEqual(red);
        expect(service.previewCtx.strokeStyle).toEqual(red);
    });

    it('should change the ccanvas to prepare for trait', () => {
        const blue = '#0000ff';
        service.primaryColor = blue;
        service.enableTrait();
        expect(service.baseCtx.strokeStyle).toEqual(blue);
        expect(service.previewCtx.strokeStyle).toEqual(blue);
    });

    it('should set the border shape requirement', () => {
        const blue = '#0000ff';
        service.secondaryColor = blue;
        service.enableFormes(ShapeType.Border, service.baseCtx);
        expect(service.baseCtx.strokeStyle).toEqual(blue);
    });

    it('should set the Border_full shape requirement', () => {
        const blue = '#0000ff';
        const red = '#ff0000';
        service.primaryColor = red;
        service.secondaryColor = blue;
        service.enableFormes(ShapeType.Border_full, service.baseCtx);
        expect(service.baseCtx.strokeStyle).toEqual(blue);
        expect(service.baseCtx.fillStyle).toEqual(red);
    });

    it('should set the Select requirement', () => {
        service.enableSelect();
        expect(service.baseCtx.strokeStyle).toEqual('#000000');
        expect(service.previewCtx.strokeStyle).toEqual('#000000');
    });

    it('should set the Full shape requirement', () => {
        const blue = '#0000ff';
        const red = '#ff0000';
        service.primaryColor = blue;
        service.secondaryColor = red;
        service.enableFormes(ShapeType.Full, service.baseCtx);
        expect(service.baseCtx.strokeStyle).toEqual(blue);
        expect(service.baseCtx.fillStyle).toEqual(blue);
    });

    it('should change the fill stype', () => {
        const red = '#ff0000';
        service.changefillStyle(red);
        expect(service.secondaryColor).toEqual(red);
    });

    it('should rezise the canvas', () => {
        const newHeight = 300;
        const newWidth = 300;
        service.resize(newWidth, newHeight);
        expect(service.baseCtx.canvas.width).toEqual(newWidth);
        expect(service.previewCtx.canvas.width).toEqual(newWidth);
        expect(service.canvas.width).toEqual(newWidth);

        expect(service.baseCtx.canvas.height).toEqual(newHeight);
        expect(service.previewCtx.canvas.height).toEqual(newHeight);
        expect(service.canvas.height).toEqual(newHeight);
    });

    it('should rezise the canvas to minimum dimension', () => {
        const newHeight = 1;
        const newWidth = 1;
        service.resize(newWidth, newHeight);
        expect(service.baseCtx.canvas.width).toEqual(MIN_CANVAS_WIDTH);
        expect(service.previewCtx.canvas.width).toEqual(MIN_CANVAS_WIDTH);
        expect(service.canvas.width).toEqual(MIN_CANVAS_WIDTH);

        expect(service.baseCtx.canvas.height).toEqual(MIN_CANVAS_HEIGHT);
        expect(service.previewCtx.canvas.height).toEqual(MIN_CANVAS_HEIGHT);
        expect(service.canvas.height).toEqual(MIN_CANVAS_HEIGHT);
    });

    it('should rezise the canvas with white pixel for the new ones', () => {
        const extraHeight = 1;
        const extraWidth = 1;
        service.baseCtx.canvas.width = MIN_CANVAS_WIDTH;
        service.baseCtx.canvas.height = MIN_CANVAS_HEIGHT;
        service.baseCtx.fillStyle = '#ffffff';
        service.baseCtx.fillRect(0, 0, service.canvas.width, service.canvas.height);

        service.resize(service.canvas.width + extraWidth, service.canvas.height + extraHeight);
        const data = service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data;
        expect(data[data.length - 1]).toEqual(maxColorValue); // R
        expect(data[data.length - 2]).toEqual(maxColorValue); // G
        // tslint:disable-next-line: no-magic-numbers
        expect(data[data.length - 3]).toEqual(maxColorValue); // B
        // tslint:disable-next-line: no-magic-numbers
        expect(data[data.length - 4]).toEqual(0); // A
    });

    it('should delete the pixel that are not in the new canvas', () => {
        const extraHeight = 1;
        const extraWidth = 1;
        service.baseCtx.canvas.width = MIN_CANVAS_WIDTH + 1;
        service.baseCtx.canvas.height = MIN_CANVAS_HEIGHT + 1;

        service.resize(service.canvas.width - extraWidth, service.canvas.height - extraHeight);
        const image = service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height);
        expect(image.width).toEqual(MIN_CANVAS_WIDTH + 1 - extraWidth);
        expect(image.height).toEqual(MIN_CANVAS_HEIGHT + 1 - extraHeight);
    });

    it('should change the current image canvas', () => {
        const extraHeight = 1;
        const extraWidth = 1;
        service.baseCtx.canvas.width = MIN_CANVAS_WIDTH;
        service.baseCtx.canvas.height = MIN_CANVAS_HEIGHT;
        const canvasBefore = service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height);

        service.resize(service.canvas.width + extraWidth, service.canvas.height + extraHeight);
        const canvasImg = service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height);

        expect(canvasBefore.width).toEqual(canvasImg.width - extraWidth);
        expect(canvasBefore.height).toEqual(canvasImg.height - extraHeight);
    });

    it('should clear the canvas', () => {
        service.baseCtx.canvas.width = 1;
        service.baseCtx.canvas.height = 1;
        service.baseCtx.fillStyle = '#ffffff';
        service.baseCtx.fillRect(0, 0, service.canvas.width, service.canvas.height);
        service.clearCanvas(service.baseCtx);
        expect(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data[0]).toEqual(0);
    });

    it('should save the canvas', () => {
        service.baseCtx.canvas.width = 1;
        service.baseCtx.canvas.height = 1;
        service.baseCtx.fillStyle = '#ffffff';
        const red = 255;
        service.baseCtx.fillRect(0, 0, service.canvas.width, service.canvas.height);
        service.saveCanvas();
        expect(service.currentCanvas.data[0]).toEqual(red);
    });

    it('should restore the canvas', () => {
        service.baseCtx.canvas.width = 1;
        service.baseCtx.canvas.height = 1;
        service.baseCtx.fillStyle = '#ffffff';
        service.currentCanvas = service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height);
        service.baseCtx.fillRect(0, 0, service.canvas.width, service.canvas.height);
        service.restoreCanvas();
        expect(service.currentCanvas.data[0]).toEqual(0);
    });

    it('should return the canvas width', () => {
        service.baseCtx.canvas.width = 1;
        expect(service.width).toEqual(1);
    });

    it('should return the canvas height', () => {
        service.baseCtx.canvas.height = 1;
        expect(service.height).toEqual(1);
    });

    it('should return if the point is on the canvas or not', () => {
        service.canvas.height = 1;
        service.canvas.width = 1;
        expect(service.isPointsOnCanvas(0, 0)).toBeTrue();
        expect(service.isPointsOnCanvas(2, 2)).toBeFalse();
        // tslint:disable-next-line: no-magic-numbers
        expect(service.isPointsOnCanvas(-1, -1)).toBeFalse();
    });

    it('should throw a exception if the rgb is invalid', () => {
        const invalidRed = -1;
        expect(() => {
            service.rgbToHex(invalidRed, 1, 1);
        }).toThrowError(RangeError);
        const invalidGreater = 300;
        expect(() => {
            service.rgbToHex(1, 1, invalidGreater);
        }).toThrowError(RangeError);
    });

    it('should convert the rgb to hex', () => {
        expect(service.rgbToHex(0, 0, 0)).toBe('0');
    });

    it('should get the pixel color', () => {
        service.baseCtx.canvas.width = 1;
        service.baseCtx.canvas.height = 1;
        service.baseCtx.fillStyle = '#ffffff';
        service.baseCtx.fillRect(0, 0, service.canvas.width, service.canvas.height);
        expect(service.getPixelColor(0, 0)).toEqual('#ffffff');
    });
});
