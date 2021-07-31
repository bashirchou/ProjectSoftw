import { Injectable } from '@angular/core';
import {
    DEFAULT_RADIAN_ANGLE,
    DEFAULT_RADIAN_SCROLL_ANGLE,
    ETAMP_INITIAL_SIZE,
    imageSizeMultiplicator,
    MouseButton,
    SLOW_RADIAN_SCROLL_ANGLE,
    stampSelection,
    ToolSelector,
} from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { StampCommand } from '@app/classes/undoredoCommands/stamp-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    private pathData: Vec2[];
    private drawSlowRotation: boolean = false;
    private angleInRadians: number = DEFAULT_RADIAN_ANGLE;
    private img: HTMLImageElement = new Image();

    stampArray: number = 0;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.Etampe, 'explicit', false, 'etampe', 'd');
        this.thickness = ETAMP_INITIAL_SIZE;

        this.clearPath();
    }
    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // this.drawStamp(this.drawingService.baseCtx, mousePosition);
            const command = new StampCommand(this, this.drawingService.baseCtx, mousePosition, this.stampArray, this.drawingService);
            this.undoRedoService.addCommand(command);
            command.execute();
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.pathData.push(mousePosition);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawStamp(this.drawingService.previewCtx, mousePosition);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.altKey) this.drawSlowRotation = false;
    }
    onKeyDown(event: KeyboardEvent): void {
        if (event.altKey) this.drawSlowRotation = true;
    }

    onMouseLeave(event: MouseEvent): void {
        this.disableDraw = true;
    }

    onMouseOver(event: MouseEvent): void {
        this.disableDraw = false;
    }

    onWindowScroll(event: WheelEvent, path: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        // tslint:disable-next-line: no-magic-numbers
        if (!this.drawSlowRotation) {
            this.rotation(DEFAULT_RADIAN_SCROLL_ANGLE, event);
        } else {
            this.rotation(SLOW_RADIAN_SCROLL_ANGLE, event);
        }

        this.drawStamp(this.drawingService.previewCtx, path);
    }

    rotation(angle: number, event: WheelEvent): void {
        if (event.deltaY < 0) {
            this.angleInRadians = this.angleInRadians - angle;
        } else if (event.deltaY > 0) {
            this.angleInRadians = this.angleInRadians + angle;
        }
    }

    drawStamp(ctx: CanvasRenderingContext2D, path: Vec2): void {
        const imageSrc = stampSelection.get(this.stampArray);
        if (imageSrc != undefined) {
            this.img.src = imageSrc;
        } else {
            throw new Error('There is no stamp.');
        }

        if (this.drawingService.mouseOnCanvas) {
            const x = path.x;
            const y = path.y;
            ctx.translate(x, y);
            ctx.rotate(this.angleInRadians);
            ctx.drawImage(
                this.img,
                -(this.thickness * imageSizeMultiplicator) / 2,
                -(this.thickness * imageSizeMultiplicator) / 2,
                this.thickness * imageSizeMultiplicator,
                this.thickness * imageSizeMultiplicator,
            );
            ctx.rotate(-this.angleInRadians);
            ctx.translate(-x, -y);
        }
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
