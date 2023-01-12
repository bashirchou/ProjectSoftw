import { ComponentRef } from '@angular/core';
import { Coord } from 'src/app/Classes/coord';
import { DrawingElement } from 'src/app/Classes/drawing-element';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { SelectionService } from './selection.service';

export class RotateSelection {

    private readonly DEFAULT_ROTATION: number = 15;
    private readonly MODIFIED_ROTATION: number = 1;

    private shiftHeld: boolean;
    private altKeyHeld: boolean;

    constructor(
        private drawingState: DrawingStateService,
        private selectionService: SelectionService,
    ) {
        this.shiftHeld = false;
        this.altKeyHeld = false;
    }

    keyDown(event: KeyboardEvent): void {
        if (!this.drawingState.isBusy()) {
            this.shiftHeld = event.shiftKey;
            this.altKeyHeld = event.altKey;
            event.preventDefault();
        }
    }

    keyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            this.shiftHeld = false;
        }
        if (event.code === 'AltLeft' || event.code === 'AltRight') {
            this.altKeyHeld = false;
        }
    }

    onWheel(wheel: WheelEvent): void {
        if (!this.drawingState.isBusy()) {
            let rotateDegree = (this.altKeyHeld) ? this.MODIFIED_ROTATION : this.DEFAULT_ROTATION;
            rotateDegree = (wheel.deltaY < 0) ? -rotateDegree : rotateDegree;
            let around = this.selectionService.selectedRect.center();
            const rotationCenterMap = new Map<ComponentRef<DrawingElement>, Coord>();

            this.selectionService.selectedElements.forEach((elemRef) => {
                if (this.shiftHeld) {
                    const bbox = this.selectionService.getBoundingBox(elemRef);
                    around = new Coord(bbox.x + Math.floor(bbox.width / 2), bbox.y + Math.floor(bbox.height / 2));
                }
                rotationCenterMap.set(elemRef, around);
                elemRef.instance.rotate(rotateDegree, around);
                elemRef.changeDetectorRef.detectChanges();
            });
            if (!this.shiftHeld) {
                this.selectionService.selectedRect.rotate(rotateDegree);
            } else {
                const selected = this.selectionService.selectedElements;
                this.selectionService.unselectAll();
                selected.forEach((elem) => {
                    this.selectionService.addComponentToSelection(elem);
                });
            }
        }
    }
}
