import { Injectable } from '@angular/core';
import { ControlPointLocation, SelectorType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/tools/grid.service';
// tslint:disable:cyclomatic-complexity
@Injectable({
    providedIn: 'root',
})
export class LimitAssignService {
    constructor(private gridService: GridService) {}
    limitAssignation(path: Vec2[], lowerLimit: Vec2, upperLimit: Vec2, selectorType: SelectorType): void {
        const height = path[path.length - 1].y - path[0].y;
        const width = path[path.length - 1].x - path[0].x;
        if (selectorType === SelectorType.Polygonal) {
            this.limitPolygonal(path, lowerLimit, upperLimit);
        } else if (selectorType === SelectorType.All) {
            lowerLimit.x = lowerLimit.y = 0;
            upperLimit.x = width;
            upperLimit.y = height;
        } else {
            if (path[path.length - 1].y > path[0].y) {
                upperLimit.y = path[0].y + height;
                lowerLimit.y = path[0].y;
            } else {
                upperLimit.y = path[0].y;
                lowerLimit.y = path[0].y + height;
            }
            if (path[path.length - 1].x > path[0].x) {
                upperLimit.x = path[0].x + width;
                lowerLimit.x = path[0].x;
            } else {
                upperLimit.x = path[0].x;
                lowerLimit.x = path[0].x + width;
            }
        }
    }

    limitPolygonal(path: Vec2[], lowerLimit: Vec2, upperLimit: Vec2): void {
        let maxX = 0;
        let minX = 1000000;
        let maxY = 0;
        let minY = 1000000;
        for (const point of path) {
            if (point.x > maxX) {
                maxX = point.x;
            }
            if (point.x < minX) {
                minX = point.x;
            }
            if (point.y > maxY) {
                maxY = point.y;
            }
            if (point.y < minY) {
                minY = point.y;
            }
        }
        lowerLimit.x = minX;
        upperLimit.x = maxX;
        lowerLimit.y = minY;
        upperLimit.y = maxY;
    }

    adaptedAssignation(mousePosition: Vec2, lowerLimit: Vec2, upperLimit: Vec2, ajustementVec: Vec2): void {
        const width = upperLimit.x - lowerLimit.x;
        const height = upperLimit.y - lowerLimit.y;
        lowerLimit.x = mousePosition.x - ajustementVec.x;
        lowerLimit.y = mousePosition.y - ajustementVec.y;
        upperLimit.x = lowerLimit.x + width;
        upperLimit.y = lowerLimit.y + height;
    }

    pathdAssignationPolygonal(oldPositionX: number, oldPositionY: number, newPositionX: number, newPositionY: number, path: Vec2[]): void {
        for (const point of path) {
            point.x += newPositionX - oldPositionX;
            point.y += newPositionY - oldPositionY;
        }
    }

    resizedAssignPolygonal(mousePosition: Vec2, base: Vec2, width: number, height: number, resizePath: Vec2[], originalPath: Vec2[]): void {
        let factorX = 0;
        let factorY = 0;
        if (width !== 0) factorX = (mousePosition.x - base.x) / width;
        if (height !== 0) factorY = (mousePosition.y - base.y) / height;

        for (let i = 0; i < resizePath.length; i++) {
            resizePath[i].x = base.x + (originalPath[i].x - base.x) * factorX;
            resizePath[i].y = base.y + (originalPath[i].y - base.y) * factorY;
        }
    }

    resizeAssignation(lowerLimit: Vec2, upperLimit: Vec2, width: number, height: number): void {
        if (height > 0) {
            upperLimit.y = lowerLimit.y + height;
        } else if (height < 0) {
            lowerLimit.y = upperLimit.y - height;
        }
        if (width > 0) {
            upperLimit.x = lowerLimit.x + width;
        } else if (width < 0) {
            lowerLimit.x = upperLimit.x - width;
        }
    }
    controlPointVerification(path: Vec2, lowerLimit: Vec2, upperLimit: Vec2, width: number, height: number): ControlPointLocation {
        const AJUSTEMENT_CP = 30;
        if (
            path.y < lowerLimit.y + AJUSTEMENT_CP &&
            path.y > lowerLimit.y - AJUSTEMENT_CP &&
            path.x < upperLimit.x + AJUSTEMENT_CP &&
            path.x > upperLimit.x - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.topRight;
        } else if (
            path.y < lowerLimit.y + AJUSTEMENT_CP &&
            path.y > lowerLimit.y - AJUSTEMENT_CP &&
            path.x < lowerLimit.x + AJUSTEMENT_CP &&
            path.x > lowerLimit.x - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.topLeft;
        } else if (
            path.y < upperLimit.y + AJUSTEMENT_CP &&
            path.y > upperLimit.y - AJUSTEMENT_CP &&
            path.x < upperLimit.x + AJUSTEMENT_CP &&
            path.x > upperLimit.x - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.bottomRight;
        } else if (
            path.y < upperLimit.y + AJUSTEMENT_CP &&
            path.y > upperLimit.y - AJUSTEMENT_CP &&
            path.x < lowerLimit.x + AJUSTEMENT_CP &&
            path.x > lowerLimit.x - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.bottomLeft;
        } else if (
            path.y < lowerLimit.y + AJUSTEMENT_CP &&
            path.y > lowerLimit.y - AJUSTEMENT_CP &&
            path.x < lowerLimit.x + width / 2 + AJUSTEMENT_CP &&
            path.x > lowerLimit.x + width / 2 - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.middleTop;
        } else if (
            path.y < lowerLimit.y + height / 2 + AJUSTEMENT_CP &&
            path.y > lowerLimit.y + height / 2 - AJUSTEMENT_CP &&
            path.x < lowerLimit.x + AJUSTEMENT_CP &&
            path.x > lowerLimit.x - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.middleLeft;
        } else if (
            path.y < lowerLimit.y + height / 2 + AJUSTEMENT_CP &&
            path.y > lowerLimit.y + height / 2 - AJUSTEMENT_CP &&
            path.x < upperLimit.x + AJUSTEMENT_CP &&
            path.x > upperLimit.x - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.middleRight;
        } else if (
            path.y < upperLimit.y + AJUSTEMENT_CP &&
            path.y > upperLimit.y - AJUSTEMENT_CP &&
            path.x < lowerLimit.x + width / 2 + AJUSTEMENT_CP &&
            path.x > lowerLimit.x + width / 2 - AJUSTEMENT_CP
        ) {
            return ControlPointLocation.middleBottom;
        }
        return ControlPointLocation.none;
    }

    adaptedAssignationMagetisme(lowerLimit: Vec2, upperLimit: Vec2, ajustementVec: Vec2, mousePosition: Vec2): void {
        const width = upperLimit.x - lowerLimit.x;
        const height = upperLimit.y - lowerLimit.y;
        lowerLimit.x = mousePosition.x - ajustementVec.x;
        lowerLimit.y = mousePosition.y - ajustementVec.y;
        this.onGridSelection(lowerLimit);
        upperLimit.x = lowerLimit.x + width;
        upperLimit.y = lowerLimit.y + height;
    }

    adaptedAssignationMagetismeArrow(lowerLimit: Vec2, upperLimit: Vec2, ajustement: number, arrowDirection: string): void {
        // tslint:disable-next-line: prefer-switch
        if (arrowDirection === 'ArrowRight' || arrowDirection === 'ArrowLeft') {
            const width = upperLimit.x - lowerLimit.x;
            lowerLimit.x += ajustement;

            this.onGridSelection(lowerLimit);
            upperLimit.x = lowerLimit.x + width;
        } else if (arrowDirection === 'ArrowUp' || arrowDirection === 'ArrowDown') {
            const height = upperLimit.y - lowerLimit.y;
            lowerLimit.y += ajustement;
            this.onGridSelection(lowerLimit);
            upperLimit.y = lowerLimit.y + height;
        }
    }

    onGridSelection(lowerLimit: Vec2): void {
        const squareDimensionPixelInternal: number = this.gridService.squareDimensionPixel;
        if (lowerLimit.x % squareDimensionPixelInternal >= squareDimensionPixelInternal / 2) {
            lowerLimit.x = lowerLimit.x + (squareDimensionPixelInternal - (lowerLimit.x % squareDimensionPixelInternal));
        } else if (lowerLimit.x % squareDimensionPixelInternal < squareDimensionPixelInternal / 2) {
            lowerLimit.x = lowerLimit.x - (lowerLimit.x % squareDimensionPixelInternal);
        }
        if (lowerLimit.y % squareDimensionPixelInternal >= squareDimensionPixelInternal / 2) {
            lowerLimit.y = lowerLimit.y + (squareDimensionPixelInternal - (lowerLimit.y % squareDimensionPixelInternal));
        } else if (lowerLimit.y % squareDimensionPixelInternal < squareDimensionPixelInternal / 2) {
            lowerLimit.y = lowerLimit.y - (lowerLimit.y % squareDimensionPixelInternal);
        }
    }
}
