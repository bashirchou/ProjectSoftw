import { Injectable } from '@angular/core';
import { SelectorType } from '@app/classes/constant';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class SelectionDrawingService {
    controlPoints(ctx: CanvasRenderingContext2D, lowerLimit: Vec2, upperLimit: Vec2, thickness: number): void {
        ctx.beginPath();
        ctx.lineCap = 'round';
        const largeur = 8;
        const width = upperLimit.x - lowerLimit.x;
        const height = upperLimit.y - lowerLimit.y;
        ctx.lineWidth = largeur + thickness;
        ctx.moveTo(upperLimit.x, upperLimit.y);
        ctx.lineTo(upperLimit.x, upperLimit.y);

        ctx.moveTo(lowerLimit.x, lowerLimit.y);
        ctx.lineTo(lowerLimit.x, lowerLimit.y);

        ctx.moveTo(lowerLimit.x, upperLimit.y);
        ctx.lineTo(lowerLimit.x, upperLimit.y);

        ctx.moveTo(upperLimit.x, lowerLimit.y);
        ctx.lineTo(upperLimit.x, lowerLimit.y);

        ctx.moveTo(lowerLimit.x + width / 2, lowerLimit.y);
        ctx.lineTo(lowerLimit.x + width / 2, lowerLimit.y);

        ctx.moveTo(lowerLimit.x, lowerLimit.y + height / 2);
        ctx.lineTo(lowerLimit.x, lowerLimit.y + height / 2);

        ctx.moveTo(lowerLimit.x + width / 2, upperLimit.y);
        ctx.lineTo(lowerLimit.x + width / 2, upperLimit.y);

        ctx.moveTo(upperLimit.x, lowerLimit.y + height / 2);
        ctx.lineTo(upperLimit.x, lowerLimit.y + height / 2);
        ctx.stroke();
    }

    drawBorder(ctx: CanvasRenderingContext2D, lowerLimit: Vec2, upperLimit: Vec2, thickness: number, selectorType: SelectorType, path: Vec2[]): void {
        const width = upperLimit.x - lowerLimit.x;
        const height = upperLimit.y - lowerLimit.y;
        const AJUSTEMENT = 0.5;
        this.controlPoints(ctx, lowerLimit, upperLimit, thickness);
        const dotedPatern = 6;
        ctx.lineWidth = 1;
        ctx.setLineDash([dotedPatern]);
        ctx.strokeRect(lowerLimit.x - AJUSTEMENT, lowerLimit.y - AJUSTEMENT, width + 1, height + 1);
        ctx.beginPath();
        if (selectorType === SelectorType.Ellipse) {
            ctx.ellipse(
                lowerLimit.x + width / 2 - AJUSTEMENT,
                lowerLimit.y + height / 2 - AJUSTEMENT,
                Math.abs(width + 2) / 2,
                Math.abs(height + 2) / 2,
                Math.PI,
                0,
                2 * Math.PI,
            );
        } else if (selectorType === SelectorType.Polygonal) {
            for (const point of path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
        }
        ctx.stroke();
        ctx.setLineDash([0]);
    }
    clearFirstTime(
        ctx: CanvasRenderingContext2D,
        selectorType: SelectorType,
        signWidth: number,
        signHeight: number,
        linePath: Vec2[],
        lowerLimit: Vec2,
        width: number,
        height: number,
    ): void {
        ctx.save();
        ctx.beginPath();
        if (selectorType === SelectorType.Ellipse) {
            ctx.ellipse(
                lowerLimit.x + (width / 2) * signWidth,
                lowerLimit.y + (height / 2) * signHeight,
                Math.abs(width / 2),
                Math.abs(height / 2),
                Math.PI,
                0,
                2 * Math.PI,
            );
            ctx.clip();
        } else if (selectorType === SelectorType.Polygonal) {
            for (const point of linePath) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
            ctx.clip();
        }
        ctx.fillStyle = 'white';
        ctx.fillRect(lowerLimit.x, lowerLimit.y, width, height);
        ctx.restore();
    }
}
