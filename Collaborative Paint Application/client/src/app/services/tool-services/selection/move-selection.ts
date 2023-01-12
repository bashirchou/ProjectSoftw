import { Coord } from 'src/app/Classes/coord';
import { TranslationCommand } from '../../command-invoker/commands/translation-command';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { SelectionService } from './selection.service';

export class MoveSelectionService {
    private readonly KEYBOARD_MOVE_SPEED: number = 3;

    private previousPos: Coord;
    private translationCommand: TranslationCommand;
    private isMovingSelection: boolean;
    private heldKeys: Map<string, boolean>;

    constructor(
        private drawingState: DrawingStateService,
        private selectionService: SelectionService,
    ) {
        this.heldKeys = new Map<string, boolean>();
    }

    startMouseMoveSelection(): void {
        if (this.selectionService.eventTarget.id === this.selectionService.selectedRect.SELECTED_RECT_ID || this.targetIsSelected()) {
            this.drawingState.setBusy();
            this.isMovingSelection = true;
            this.startMove();
        }
    }

    targetIsSelected(): boolean {
        return this.selectionService.selectedElements.find((ref) =>
            ref.location.nativeElement.firstChild === this.selectionService.eventTarget
            || ref.location.nativeElement.firstChild === this.selectionService.eventTarget.parentElement
        ) !== undefined;
    }

    mouseMove(mousePos: Coord): void {
        if (this.isMovingWithMouse()) {
            const delta = new Coord(mousePos.x, mousePos.y).substract(this.previousPos);
            this.moveSelection(delta);
            this.previousPos = mousePos;
        }
    }

    keyDown(event: KeyboardEvent): void {
        if (!this.isMovingSelection) {
            if (!this.drawingState.isBusy() && !this.selectionService.selectionIsEmpty() && this.isArrowKey(event.key)) {
                this.drawingState.setBusy();
                this.startMove();
            }
            if (this.drawingState.isBusy()) {
                const translation: Coord = new Coord();
                if (!event.repeat) {
                    this.heldKeys.set(event.key, true);
                }
                if (this.heldKeys.get('ArrowUp')) {
                    translation.substract(new Coord(0, this.KEYBOARD_MOVE_SPEED));
                }
                if (this.heldKeys.get('ArrowDown')) {
                    translation.add(new Coord(0, this.KEYBOARD_MOVE_SPEED));
                }
                if (this.heldKeys.get('ArrowRight')) {
                    translation.add(new Coord(this.KEYBOARD_MOVE_SPEED, 0));
                }
                if (this.heldKeys.get('ArrowLeft')) {
                    translation.substract(new Coord(this.KEYBOARD_MOVE_SPEED, 0));
                }
                this.moveSelection(translation);
            }
        }
    }

    keyUp(event: KeyboardEvent): void {
        if (this.drawingState.isBusy() && !this.isMovingSelection && this.isArrowKey(event.key)) {
            this.heldKeys.delete(event.key);
            if (this.heldKeys.size === 0) {
                this.drawingState.setAvailable();
            }
        }
    }

    isMovingWithKeyboard(): boolean {
        return this.heldKeys.size !== 0;
    }

    isMovingWithMouse(): boolean {
        return this.isMovingSelection;
    }

    finishTranslation(): void {
        if (this.isMovingWithKeyboard() || this.isMovingWithMouse()) {
            this.isMovingSelection = false;
        }
    }

    private startMove(): void {
        this.previousPos = this.selectionService.mousePositionOnDown;
        this.translationCommand = new TranslationCommand(new Coord(), this.selectionService.selectedElements);
    }

    private moveSelection(delta: Coord): void {
        this.translationCommand.translation.add(delta);
        this.selectionService.selectedElements.forEach((element) => element.instance.translate(delta));
        this.selectionService.selectedRect.translate(delta);
    }

    private isArrowKey(key: string): boolean {
        return key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight';
    }

}
