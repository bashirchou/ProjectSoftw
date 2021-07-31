import { Injectable } from '@angular/core';
import { ArrowDirection } from '@app/classes/arrow-direction';

@Injectable({
    providedIn: 'root',
})
export class KeyDisplacementService {
    delayMovement: number = 500;
    delayPixel: number = 100;
    canMove: boolean = true;
    timer(): boolean {
        setTimeout(() => {
            this.canMove = true;
        }, this.delayMovement);
        return this.canMove;
    }
    timer100ms(): boolean {
        setTimeout(() => {
            this.canMove = true;
        }, this.delayPixel);
        return this.canMove;
    }
    arrowKeyAssignation(event: KeyboardEvent, value: boolean, arrowDirection: ArrowDirection): void {
        if (event.key === 'ArrowRight') {
            arrowDirection.r = value;
        }
        if (event.key === 'ArrowLeft') {
            arrowDirection.l = value;
        }
        if (event.key === 'ArrowUp') {
            arrowDirection.u = value;
        }
        if (event.key === 'ArrowDown') {
            arrowDirection.d = value;
        }
    }
}
