import { Injectable } from '@angular/core';
import { ApplicationShortcut } from '@app/classes/constant';
import { Command } from '@app/classes/undoredoCommands/command';
import { DrawingService } from './drawing/drawing.service';
import { KeyHandlerService } from './tools/key-handler.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    undoHistory: Command[] = [];
    redoHistory: Command[] = [];
    constructor(private drawingService: DrawingService, private keyHandlerService: KeyHandlerService) {
        this.undoHistory = [];
        this.redoHistory = [];
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut(ApplicationShortcut.undo).subscribe((shortcut: string) => {
            this.undo();
        });
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut(ApplicationShortcut.redo).subscribe((shortcut: string) => {
            this.redo();
        });
    }

    clearHistory(): void {
        this.undoHistory = [];
        this.redoHistory = [];
    }

    undo(): void {
        if (this.undoHistory.length > 0) {
            const command = this.undoHistory.pop() as Command;
            this.redoHistory.push(command);
            this.redrawHistory();
        }
    }

    redo(): void {
        if (this.redoHistory.length > 0) {
            const command = this.redoHistory.pop() as Command;
            this.undoHistory.push(command);
            this.redrawHistory();
        }
    }

    addCommand(command: Command): void {
        this.redoHistory = [];
        this.undoHistory.push(command);
    }

    redrawHistory(): void {
        if (this.drawingService.currentCanvas != undefined) this.drawingService.restoreCanvas();
        else this.drawingService.baseCtx.clearRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.undoHistory.forEach((command: Command) => {
            command.execute();
        });
    }
}
