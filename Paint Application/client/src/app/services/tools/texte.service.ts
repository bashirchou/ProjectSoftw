import { Injectable } from '@angular/core';
import { MouseButton, ToolSelector } from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { TexteCommand } from '@app/classes/undoredoCommands/texte-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

export let keyCodes: { [key: string]: number } = {};
keyCodes = {
    Number0: 48,
    Number9: 57,
    SpaceBar: 32,
    EnterKey: 13,
    SmallA: 65,
    SmallZ: 90,
    Numpad0: 96,
    NumpadSlash: 111,
    SemiColon: 186,
    BackTick: 192,
    BracketLeft: 219,
    SingleQuote: 222,
};

@Injectable({
    providedIn: 'root',
})
export class TexteService extends Tool {
    constructor(public drawingService: DrawingService, private keyHandlerService: KeyHandlerService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Texte, 'textIcon', true, 'texte', 't');
    }

    fontSize: number = 12;
    fontList: string[] = ['Times New Roman', 'Calibri', 'Courier New', 'Verdana', 'Impact'];
    private pathData: Vec2[] = [];
    private width: number = 0;
    private height: number = 0;
    private initialPoint: Vec2 = { x: 0, y: 0 };
    isBold: boolean = false;
    isItalic: boolean = false;
    maxfontSize: number = 60;
    private modeEcriture: boolean = false;
    private text: string = '';
    private lineText: string[] = [''];
    fontStyle: string = this.fontList[0];
    private lineWidth: number = 0;
    private fontWidth: number = 0;
    private maxCharByLine: number = 0;
    private maxLines: number = 0;
    private cursorIndex: number = 0;
    private textAlignList: string[] = ['left', 'center', 'right'];
    textAlign: string = this.textAlignList[0];

    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const absHeight = Math.abs(this.height);
        const absWidth = Math.abs(this.width);

        // tslint:disable-next-line: no-magic-numbers
        if (this.mouseDown && this.drawingService.mouseOnCanvas && absHeight > 10 && absWidth > 10) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);

            if (this.pathData[this.pathData.length - 1].y < this.pathData[0].y) {
                this.initialPoint.y = this.pathData[this.pathData.length - 1].y;
            } else {
                this.initialPoint.y = this.pathData[0].y;
            }

            if (this.pathData[this.pathData.length - 1].x < this.pathData[0].x) {
                this.initialPoint.x = this.pathData[this.pathData.length - 1].x;
            } else {
                this.initialPoint.x = this.pathData[0].x;
            }

            this.lineWidth = Math.abs(this.width);
            this.fontWidth = this.fontSize / 2;
            this.maxCharByLine = Math.floor(this.lineWidth / this.fontWidth);
            this.maxLines = Math.floor(Math.abs(this.height) / this.fontSize);
            this.cursorIndex = 0;
            this.drawCursor();
            this.modeEcriture = true;
            this.keyHandlerService.isShortcutActive = false;
        }
        this.mouseDown = false;
    }

    private divideText(text: string, maxLineLength: number): string[] {
        if (maxLineLength > 0) {
            const value = text.match(new RegExp('((.{0,' + maxLineLength + '})([\r\n]{0,1}))', 'g'));
            if (value) return value;
        }
        return [''];
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (this.modeEcriture) {
            this.confirmWriting();
        }
        this.clearPath();
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);
            this.lineText = [''];
            this.text = '';
        }
    }

    private confirmWriting(): void {
        this.modeEcriture = false;
        this.drawTextSimple(false);
        this.keyHandlerService.isShortcutActive = true;
        this.undoRedoService.addCommand(
            // tslint:disable-next-line: max-line-length
            new TexteCommand(
                this,
                false,
                this.isItalic,
                this.isBold,
                this.text,
                this.textAlign,
                this.maxCharByLine,
                this.fontSize,
                this.fontStyle,
                this.width,
                this.height,
                { ...this.initialPoint },
                this.drawingService.primaryColor,
            ),
        );
    }

    drawRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        const dotedPatern = 3;
        this.height = path[path.length - 1].y - path[0].y;
        this.width = path[path.length - 1].x - path[0].x;
        ctx.setLineDash([dotedPatern]);
        ctx.rect(path[0].x, path[0].y, this.width, this.height);
        ctx.stroke();
    }

    // tslint:disable-next-line: cyclomatic-complexity
    onKeyDown(event: KeyboardEvent): void {
        const xIndex = this.cursorIndex % this.maxCharByLine;
        const yIndex = Math.floor(this.cursorIndex / this.maxCharByLine);
        // tslint:disable-next-line: deprecation
        const keycode = event.keyCode;
        const valid =
            (keycode >= keyCodes.Number0 && keycode < keyCodes.Number9) ||
            keycode === keyCodes.SpaceBar ||
            keycode === keyCodes.EnterKey ||
            (keycode >= keyCodes.SmallA && keycode <= keyCodes.SmallZ) ||
            (keycode >= keyCodes.Numpad0 && keycode <= keyCodes.NumpadSlash) ||
            (keycode >= keyCodes.SemiColon && keycode <= keyCodes.BackTick) ||
            (keycode >= keyCodes.BracketLeft && keycode <= keyCodes.SingleQuote);

        if (this.modeEcriture) {
            if (event.key === 'Escape') {
                this.confirmWriting();
            } else if (event.key === 'Backspace') {
                if (this.text.length === 1 && this.cursorIndex === 1) {
                    this.text = '';
                    this.cursorIndex--;
                    this.drawTextSimple(true);
                } else if (this.text.length > 1 && this.cursorIndex > 0) {
                    this.text = this.text.slice(0, this.cursorIndex - 1) + this.text.slice(this.cursorIndex, this.text.length);
                    this.cursorIndex--;
                    this.drawTextSimple(true);
                }
            } else if (event.key === 'ArrowRight') {
                if (
                    this.text.length > this.cursorIndex + 2 &&
                    ['\n', '\r'].includes(this.text[this.cursorIndex + 1]) &&
                    !['\n', '\r'].includes(this.text[this.cursorIndex + 2])
                ) {
                    this.cursorIndex += 2;
                    this.drawTextSimple(true);
                } else if (this.cursorIndex < this.text.length) {
                    this.cursorIndex++;
                    this.drawTextSimple(true);
                }
            } else if (event.key === 'ArrowLeft') {
                if (
                    this.cursorIndex - 2 > 0 &&
                    ['\n', '\r'].includes(this.text[this.cursorIndex - 1]) &&
                    !['\n', '\r'].includes(this.text[this.cursorIndex - 2])
                ) {
                    this.cursorIndex -= 2;
                    this.drawTextSimple(true);
                } else if (this.cursorIndex > 0) {
                    this.cursorIndex--;
                    this.drawTextSimple(true);
                }
            } else if (event.key === 'ArrowUp') {
                if (yIndex > 0) {
                    this.cursorIndex -= this.maxCharByLine;
                    this.drawTextSimple(true);
                }
            } else if (event.key === 'ArrowDown') {
                if (
                    yIndex < Math.floor(this.text.length / this.maxCharByLine) - 1 ||
                    (yIndex < Math.floor(this.text.length / this.maxCharByLine) && xIndex < this.text.length % this.maxCharByLine)
                ) {
                    this.cursorIndex += this.maxCharByLine;
                    this.drawTextSimple(true);
                }
            } else if (event.key === 'Delete') {
                if (this.text.length > this.cursorIndex) {
                    this.text = this.text.slice(0, this.cursorIndex) + this.text.slice(this.cursorIndex + 1, this.text.length);
                    this.drawTextSimple(true);
                }
            } else if (event.key === 'Enter') {
                if (this.modeEcriture) {
                    if (this.divideText(this.text, this.maxCharByLine).length < this.maxLines) {
                        this.text = this.text.substring(0, this.cursorIndex) + '\n' + this.text.substring(this.cursorIndex, this.text.length);
                        this.cursorIndex++;
                        this.drawTextSimple(true);
                    }
                }
            } else if (valid) {
                if (this.modeEcriture) {
                    if (this.divideText(this.text + event.key, this.maxCharByLine).length <= this.maxLines) {
                        this.text = this.text.substring(0, this.cursorIndex) + event.key + this.text.substring(this.cursorIndex, this.text.length);
                        this.cursorIndex++;
                    }
                    this.drawTextSimple(true);
                }
            }
        }
    }

    drawTextSimple(editing: boolean): void {
        this.drawText(
            editing,
            this.isItalic,
            this.isBold,
            this.text,
            this.textAlign,
            this.maxCharByLine,
            this.fontSize,
            this.fontStyle,
            this.width,
            this.height,
            this.initialPoint,
            this.drawingService.primaryColor,
        );
    }
    drawText(
        editing: boolean,
        isItalic: boolean,
        isBold: boolean,
        text: string,
        textAlign: string,
        maxCharByLine: number,
        fontSize: number,
        fontStyle: string,
        width: number,
        height: number,
        initialPoint: Vec2,
        color: string,
    ): void {
        const ctx = editing ? this.drawingService.previewCtx : this.drawingService.baseCtx;
        let variants = '';
        if (isItalic) {
            variants += 'italic ';
        }

        if (isBold) {
            variants += 'bold ';
        }
        ctx.font = variants + fontSize + 'px' + ' ' + fontStyle;
        this.lineText = this.divideText(text, maxCharByLine);

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (editing) {
            this.drawRectangle(this.drawingService.previewCtx, this.pathData);
            this.drawCursor();
        }
        ctx.textAlign = textAlign as CanvasTextAlign;
        let shiftX = 0;
        if (textAlign === this.textAlignList[1]) {
            shiftX = Math.abs(width) / 2;
        } else if (textAlign === this.textAlignList[2]) {
            shiftX = Math.abs(width);
        }
        ctx.fillStyle = color;
        if (this.lineText) {
            for (let index = 0; index < this.lineText.length; index++) {
                ctx.fillText(this.lineText[index], initialPoint.x + shiftX, initialPoint.y + fontSize * (index + 1));
            }
        }
    }

    drawCursor(): void {
        const tempText = this.lineText;
        const lastLine = tempText[tempText.length - 1];

        if (
            this.lineText.length < this.maxLines &&
            (['\n', '\r'].includes(this.text[this.text.length - 1]) || lastLine.length === this.maxCharByLine)
        ) {
            tempText.push('');
        }
        let tempLineIndex = 0;
        let tempCursorIndex = this.cursorIndex;
        let tempCurrentLineIndex = 0;
        for (let index = 0; index < tempText.length && tempCursorIndex > 0; index++) {
            if (tempText[index] === '') {
                tempCurrentLineIndex = 0;
                tempLineIndex++;
                break;
            }
            for (let indexInt = 0; indexInt < tempText[index].length && tempCursorIndex > 0; indexInt++) {
                tempCurrentLineIndex = indexInt + 1;
                tempCursorIndex--;
            }
            tempLineIndex++;
        }

        if (tempLineIndex !== 0) {
            tempLineIndex -= 1;
        }
        let xIndex = tempCurrentLineIndex;
        let yIndex = tempLineIndex;
        if (['\n', '\r'].includes(tempText[yIndex][xIndex - 1])) {
            xIndex = 0;
            yIndex += 1;
        }
        let x = this.initialPoint.x + xIndex * this.fontWidth;
        const y = this.initialPoint.y + yIndex * this.fontSize;
        const charsInLine = tempText[yIndex].length;
        if (this.textAlign === this.textAlignList[1]) {
            x =
                this.initialPoint.x +
                Math.abs(this.width) / 2 +
                (charsInLine * this.fontWidth) / 2 -
                (charsInLine - xIndex) * this.fontWidth +
                this.fontWidth;
            if (this.text.length === 0) {
                x = this.initialPoint.x + Math.abs(this.width) / 2;
            }
        } else if (this.textAlign === this.textAlignList[2]) {
            x = this.initialPoint.x + Math.abs(this.width) - (charsInLine - xIndex) * this.fontWidth + this.fontWidth;
            if (this.text.length === 0) {
                x = this.initialPoint.x + Math.abs(this.width);
            }
        }
        this.drawingService.previewCtx.setLineDash([0]);
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.moveTo(x, y);
        this.drawingService.previewCtx.lineTo(x, y + this.fontSize);
        this.drawingService.previewCtx.stroke();
    }

    clearPath(): void {
        this.pathData = [];
    }
    // tslint:disable-next-line: max-file-line-count
}
