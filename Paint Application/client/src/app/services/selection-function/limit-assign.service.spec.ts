import { TestBed } from '@angular/core/testing';
import { ControlPointLocation, SelectorType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { LimitAssignService } from './limit-assign.service';
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
describe('LimitAssignService', () => {
    let service: LimitAssignService;
    let lowerLimit: Vec2;
    let upperLimit: Vec2;
    let path: Vec2[] = [];
    let width: number;
    let height: number;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(LimitAssignService);
        lowerLimit = { x: 0, y: 0 };
        upperLimit = { x: 1, y: 1 };
        width = 1;
        height = 1;
        path = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: 1, y: 1 });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('limit Assignation should set the lowerLimit and UpperLimit to correct position', () => {
        const expectedLowerLimit = { x: 0, y: 0 };
        const expectedUpperLimit = { x: 1, y: 1 };

        service.limitAssignation(path, lowerLimit, upperLimit, SelectorType.Rectangle);
        expect(lowerLimit.x).toEqual(expectedLowerLimit.x);
        expect(upperLimit.x).toEqual(expectedUpperLimit.x);
        expect(lowerLimit.y).toEqual(expectedLowerLimit.y);
        expect(upperLimit.y).toEqual(expectedUpperLimit.y);
    });

    it('when selectorType is equal to Selector.All, lowerlimits coordinate is (0,0) in upperLimit is equal to the width or height.', () => {
        width = 10;
        height = 10;
        const expectedLowerLimit: Vec2 = { x: 0, y: 0 };
        const expectedupperLimit: Vec2 = { x: width, y: height };
        path.push({ x: width, y: height });

        service.limitAssignation(path, lowerLimit, upperLimit, SelectorType.All);
        expect(lowerLimit.x).toEqual(expectedLowerLimit.x);
        expect(upperLimit.x).toEqual(expectedupperLimit.x);
        expect(lowerLimit.y).toEqual(expectedLowerLimit.y);
        expect(upperLimit.y).toEqual(expectedupperLimit.y);
    });

    it('if the last point of path data (x axis) is smaller than the first, upperLimitX should be equal to the frst and lowerLimitX is the first minus the width', () => {
        path = [];
        path.push({ x: 0, y: 0 });
        path.push({ x: -1, y: -1 });
        const expectedLowerLimitX = path[path.length - 1].x;
        const expectedUpperLimitX = path[0].x;
        service.limitAssignation(path, lowerLimit, upperLimit, SelectorType.Rectangle);
        expect(lowerLimit.x).toEqual(expectedLowerLimitX);
        expect(upperLimit.x).toEqual(expectedUpperLimitX);
    });
    it('AdaptedAssignation changes the values of lowerLimit and Upperlimit', () => {
        width = 10;
        height = 10;
        const expectedResultLower: Vec2 = { x: 3, y: 3 };
        const ajustement: Vec2 = { x: 2, y: 2 };
        const mousePosition: Vec2 = { x: 5, y: 5 };

        lowerLimit = { x: 1, y: 1 };
        service.adaptedAssignation(mousePosition, lowerLimit, upperLimit, ajustement);
        expect(lowerLimit.x).toEqual(expectedResultLower.x);
    });

    it('on limipolygonal changes the lower limit should equal to the minimu values and upperlimit to the maximum of the pathvalues', () => {
        path.push({ x: 2, y: 2 });
        const expectedLowerLimit: Vec2 = { x: 0, y: 0 };
        const expectedUpperLimit: Vec2 = { x: 2, y: 2 };
        service.limitPolygonal(path, lowerLimit, upperLimit);
        expect(lowerLimit.x).toEqual(expectedLowerLimit.x);
        expect(lowerLimit.y).toEqual(expectedLowerLimit.y);
        expect(upperLimit.x).toEqual(expectedUpperLimit.x);
        expect(upperLimit.y).toEqual(expectedUpperLimit.y);
    });

    it('on pathdAssignationPolygonal every point in the point sould be translate accrding to the new position', () => {
        const oldPosition = { x: 3, y: 3 };
        const newPosition = { x: 5, y: 5 };
        const expectedResult: Vec2[] = [];
        expectedResult.push({ x: 2, y: 2 });
        expectedResult.push({ x: 3, y: 3 });

        service.pathdAssignationPolygonal(oldPosition.x, oldPosition.y, newPosition.x, newPosition.y, path);
        expect(path[0].x).toEqual(expectedResult[0].x);
        expect(path[1].x).toEqual(expectedResult[1].x);
        expect(path[0].y).toEqual(expectedResult[0].y);
        expect(path[1].y).toEqual(expectedResult[1].y);
    });
    it('On resizedAssignPolygonal, if the mouse position - base is 2 time more than the width and the heigth, last point of the path soudl be 2 time his value ', () => {
        const mousePosition: Vec2 = { x: 2 * width, y: 2 * height + 1 };
        const expectedResult = { x: 2 * path[path.length - 1].x, y: 1 };
        service.resizedAssignPolygonal(mousePosition, { x: 0, y: 1 }, width, height, path, path);
        expect(path[path.length - 1].x).toEqual(expectedResult.x);
        expect(path[path.length - 1].y).toEqual(expectedResult.y);
    });
    it('On controlPointVerification, if the mouse position is near a control point, it should return the ', () => {
        lowerLimit = { x: 0, y: 0 };
        upperLimit = { x: 500, y: 500 };
        width = 500;
        height = 500;
        path.push({ x: 0, y: 0 });
        path.push({ x: 500, y: 500 });
        expect(service.controlPointVerification({ x: 490, y: 10 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.topRight);
        expect(service.controlPointVerification({ x: 490, y: 490 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.bottomRight);
        expect(service.controlPointVerification({ x: 10, y: 490 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.bottomLeft);
        expect(service.controlPointVerification({ x: 10, y: 10 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.topLeft);
        expect(service.controlPointVerification({ x: 250, y: 10 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.middleTop);
        expect(service.controlPointVerification({ x: 10, y: 250 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.middleLeft);
        expect(service.controlPointVerification({ x: 250, y: 500 }, lowerLimit, upperLimit, width, height)).toEqual(
            ControlPointLocation.middleBottom,
        );
        expect(service.controlPointVerification({ x: 500, y: 250 }, lowerLimit, upperLimit, width, height)).toEqual(ControlPointLocation.middleRight);
    });
    it('On controlPointVerification, if the mouse position is out of the control point section should return false ', () => {
        lowerLimit = { x: 0, y: 0 };
        upperLimit = { x: 100, y: 100 };
        width = 100;
        height = 100;
        path.push({ x: 0, y: 0 });
        path.push({ x: 100, y: 100 });
        expect(service.controlPointVerification({ x: 600, y: 600 }, lowerLimit, upperLimit, width, height)).toBe(ControlPointLocation.none);
    });
    it('On resizeAssignation, if the heigth and the width is > 0 the upperLimit should be incremented ', () => {
        const expectResult = { x: lowerLimit.x + width, y: lowerLimit.y + height };
        service.resizeAssignation(lowerLimit, upperLimit, width, height);
        expect(upperLimit.x).toEqual(expectResult.x);
        expect(upperLimit.y).toEqual(expectResult.y);
    });

    it('adaptedAssignationMagetisme should ajuste the selection rectangle to the grid', () => {
        const lower: Vec2 = { x: 0, y: 0 };
        const upper: Vec2 = { x: 0, y: 0 };
        const ajustementVec: Vec2 = { x: 0, y: 0 };
        const mousePosition: Vec2 = { x: 0, y: 0 };
        const spyOnGridSelection = spyOn(service, 'onGridSelection');
        service.adaptedAssignationMagetisme(lower, upper, ajustementVec, mousePosition);
        expect(spyOnGridSelection).toHaveBeenCalled();
    });

    it('adaptedAssignationMagetismeArrow should ajuste the selection rectangle to the grid, on right arrow', () => {
        const lower = { x: 0, y: 0 };
        const upper = { x: 0, y: 0 };
        const ajustement = 1;
        const arrowDirection = 'ArrowRight';
        const spyOnGridSelection = spyOn(service, 'onGridSelection');
        service.adaptedAssignationMagetismeArrow(lower, upper, ajustement, arrowDirection);
        expect(lower.x).toEqual(1);
        expect(upper.x).toEqual(1);
        expect(spyOnGridSelection).toHaveBeenCalled();
    });

    it('adaptedAssignationMagetismeArrow should ajuste the selection rectangle to the grid, on up arrow', () => {
        const lower = { x: 0, y: 0 };
        const upper = { x: 0, y: 0 };
        const ajustement = 1;
        const arrowDirection = 'ArrowUp';
        const spyOnGridSelection = spyOn(service, 'onGridSelection');
        service.adaptedAssignationMagetismeArrow(lower, upper, ajustement, arrowDirection);
        expect(lower.y).toEqual(1);
        expect(upper.y).toEqual(1);
        expect(spyOnGridSelection).toHaveBeenCalled();
    });

    it('onGridSelection should ajuste the lowerlimit to the grid to the left according to the grid square dimension', () => {
        const lower: Vec2 = { x: 1, y: 1 };
        service.onGridSelection(lower);
        expect(lower.x).toEqual(0);
        expect(lower.y).toEqual(0);
    });

    it('onGridSelection should ajuste the lowerlimit to the grid to the right according to the grid square dimension', () => {
        const lower: Vec2 = { x: 16, y: 16 };
        service.onGridSelection(lower);
        expect(lower.x).toEqual(30);
        expect(lower.y).toEqual(30);
    });
});
