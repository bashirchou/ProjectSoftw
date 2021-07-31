import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ADJUSTEMENT_LINE } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { PolygonalService } from './polygonal.service';
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
// tslint:disable:max-file-line-count
describe('PolygonalService', () => {
    let service: PolygonalService;
    let mouseEvent: MouseEvent;
    let ctx: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PolygonalService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ctx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        mouseEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('on linePathAssign the returning path should have the same length than pathdata', () => {
        const pathData: Vec2[] = [];
        pathData.push({ x: 0, y: 0 });
        const path = service.linePathAssign(pathData);
        expect(pathData.length).toEqual(path.length);
    });
    it('twoLineIntersection should return true if the tow line have a common point', () => {
        // first line
        const point1: Vec2 = { x: 0, y: 0 };
        const point2: Vec2 = { x: 5, y: 5 };
        // second line
        const point3: Vec2 = { x: 0, y: 5 };
        const point4: Vec2 = { x: 5, y: 0 };

        expect(service.twoLineIntersection(point1, point2, point3, point4)).toBeTruthy();
    });
    it('isIntersect should return false if the path does not have two crossing line ', () => {
        const path: Vec2[] = [];
        // first line
        path.push({ x: 0, y: 0 });
        path.push({ x: 5, y: 5 });
        // second line
        path.push({ x: 6, y: 10 });
        path.push({ x: 1, y: 1 });
        expect(service.isIntersect(mouseEvent, path)).toBeFalse();
    });
    it('twoLineIntersection should return false if the function have the same points ', () => {
        const point1: Vec2 = { x: 0, y: 0 };
        const point2: Vec2 = { x: 5, y: 5 };
        // second line
        const point3: Vec2 = { x: 0, y: 0 };
        const point4: Vec2 = { x: 5, y: 5 };
        expect(service.twoLineIntersection(point1, point2, point3, point4)).toBeFalse();
    });
    it('on drawLine lineto should be call 2 time with doted pattern', () => {
        const path: Vec2[] = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: 5, y: 5 });
        const lineToSpy = spyOn<any>(ctx, 'lineTo').and.callThrough();
        const linesetDash = spyOn<any>(ctx, 'setLineDash').and.callThrough();
        service.drawLine(ctx, path);
        expect(lineToSpy).toHaveBeenCalledTimes(2);
        expect(linesetDash).toHaveBeenCalledTimes(2);
    });
    it('on drawSelectedLine lineto should be call the same amout of time compare to the length of the path', () => {
        const path: Vec2[] = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: 5, y: 5 });
        path.push({ x: 7, y: 5 });
        const lineToSpy = spyOn<any>(ctx, 'lineTo').and.callThrough();
        service.drawSelectedLine(ctx, path);
        expect(lineToSpy).toHaveBeenCalledTimes(path.length);
    });

    it('On lineDegreeFix the angle of the line is near 45,135,225,315, the initial and the last should be equal ', () => {
        const path: Vec2[] = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: 25, y: 27 });
        const lastPoint = service.LineDegreeFix(ctx, path);
        expect(Math.round(lastPoint.x / 10) * 10).toEqual(Math.round(lastPoint.y / 10) * 10);
    });
    it('When lineDegreeFix is call and the angle of the line is near 0 or 180, hte y value of the lastPoint shluld be 0', () => {
        const path: Vec2[] = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: 25, y: 3 });
        const lastPoint = service.LineDegreeFix(ctx, path);
        expect(lastPoint.y).toEqual(0 + ADJUSTEMENT_LINE);
    });
    it('When lineDegreeFix is call and the angle of the line is near 90 or 270, hte y value of the lastPoint shluld be 0', () => {
        const path: Vec2[] = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: 1, y: 30 });
        const lastPoint = service.LineDegreeFix(ctx, path);
        expect(lastPoint.x).toEqual(0 + ADJUSTEMENT_LINE);
    });
});
