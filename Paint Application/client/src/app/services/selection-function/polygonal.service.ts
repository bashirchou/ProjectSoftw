import { Injectable } from '@angular/core';
import { ADJUSTEMENT_LINE, ANGLE_PI, ANGLE_PI_OVER_EIGHT, ANGLE_PI_OVER_FOUR, ANGLE_PI_OVER_TWO } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class PolygonalService {
    linePathAssign(path2: Vec2[]): Vec2[] {
        const path1: Vec2[] = [];
        for (const point of path2) {
            path1.push({ x: point.x, y: point.y });
        }
        return path1;
    }

    isIntersect(mousePosition: Vec2, linePath: Vec2[]): boolean {
        let isIntersect = false;
        if (linePath.length > 2) {
            for (let i = 0; i < linePath.length - 2; i++) {
                if (this.twoLineIntersection(linePath[i], linePath[i + 1], linePath[linePath.length - 1], mousePosition)) {
                    isIntersect = true;
                    break;
                }
            }
        }
        return isIntersect;
    }
    twoLineIntersection(point1: Vec2, point2: Vec2, point3: Vec2, point4: Vec2): boolean {
        const factor = (point2.x - point1.x) * (point4.y - point3.y) - (point4.x - point3.x) * (point2.y - point1.y);
        if (factor === 0) {
            return false;
        }
        const variation1 = ((point4.y - point3.y) * (point4.x - point1.x) + (point3.x - point4.x) * (point4.y - point1.y)) / factor;
        const variation2 = ((point1.y - point2.y) * (point4.x - point1.x) + (point2.x - point1.x) * (point4.y - point1.y)) / factor;
        return 0 < variation1 && variation1 < 1 && 0 < variation2 && variation2 < 1;
    }
    LineDegreeFix(ctx: CanvasRenderingContext2D, path: Vec2[]): Vec2 {
        ctx.beginPath();
        const dotedPatern = 6;
        ctx.lineWidth = 1;
        ctx.setLineDash([dotedPatern]);
        const xSide = path[path.length - 1].x - path[0].x;
        const ySide = path[path.length - 1].y - path[0].y;
        const length = Math.sqrt(xSide * xSide + ySide * ySide);

        let x = 0;
        let y = 0;

        ctx.lineTo(path[0].x, path[0].y);

        if (xSide === 0 && ySide === 0) {
            x = path[0].x + ADJUSTEMENT_LINE;
            y = path[0].y + ADJUSTEMENT_LINE;
        } else if (
            Math.abs(xSide) / length >= Math.cos(ANGLE_PI_OVER_FOUR + ANGLE_PI_OVER_EIGHT) &&
            Math.abs(xSide) / length <= Math.cos(ANGLE_PI_OVER_FOUR - ANGLE_PI_OVER_EIGHT) &&
            Math.abs(ySide) / length <= Math.sin(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR) &&
            Math.abs(ySide) / length >= Math.sin(ANGLE_PI_OVER_FOUR - ANGLE_PI_OVER_EIGHT)
        ) {
            x = path[0].x + length * (xSide / Math.abs(xSide)) * Math.cos(ANGLE_PI_OVER_FOUR);
            y = path[0].y + length * (ySide / Math.abs(ySide)) * Math.sin(ANGLE_PI_OVER_FOUR);
        } else if (
            xSide / length > -Math.cos(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR) &&
            xSide / length < Math.cos(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR) &&
            Math.abs(ySide) / length <= Math.sin(ANGLE_PI_OVER_TWO) &&
            Math.abs(ySide) / length > Math.sin(ANGLE_PI_OVER_EIGHT + ANGLE_PI_OVER_FOUR)
        ) {
            x = path[0].x + ADJUSTEMENT_LINE;
            y = path[0].y + (ySide / Math.abs(ySide)) * length * Math.sin(ANGLE_PI_OVER_TWO);
        } else if (
            Math.abs(xSide) / length >= Math.cos(ANGLE_PI_OVER_EIGHT) &&
            Math.abs(xSide) / length <= -Math.cos(ANGLE_PI) &&
            ySide / length > Math.sin(-ANGLE_PI_OVER_EIGHT) &&
            ySide / length < Math.sin(ANGLE_PI_OVER_EIGHT)
        ) {
            x = path[0].x + length * (-(xSide / Math.abs(xSide)) * Math.cos(Math.PI));
            y = path[0].y + ADJUSTEMENT_LINE;
        }

        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.setLineDash([0]);
        return { x, y };
    }
    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();

        const dotedPatern = 6;
        ctx.lineWidth = 1;
        ctx.setLineDash([dotedPatern]);
        ctx.lineTo(path[0].x, path[0].y);
        ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
        ctx.stroke();
        ctx.setLineDash([0]);
    }
    drawSelectedLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        const dotedPatern = 6;
        ctx.lineWidth = 1;
        ctx.setLineDash([dotedPatern]);
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.setLineDash([0]);
    }
}
