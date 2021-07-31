import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { dimension, maxColorValue, ToolSelector } from '@app/classes/constant';
import { ResizeCommand } from '@app/classes/undoredoCommands/resize-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/tools/grid.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: true }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: true }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('resizePreview', { static: true }) resizePreview: ElementRef<HTMLCanvasElement>;

    path: Vec2;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private resizePreviewCtx: CanvasRenderingContext2D;

    private canvasSize: Vec2 = dimension;
    toolsController: ToolsControllerService;
    rightResize: boolean = false;
    buttonResize: boolean = false;
    cornerResize: boolean = false;
    private resizing: boolean = false;
    previewHeight: number;
    previewWidth: number;
    // tslint:disable-next-line: no-magic-numbers   Because it is the ratio that is defined with flex in the css
    widthWorkingZoneRatio: number = 4 / 5;
    minVisibleWorkingZone: number = 100;
    e: KeyboardEvent;
    constructor(
        public drawingService: DrawingService,
        toolsController: ToolsControllerService,
        private previewRectangle: RectangleService,
        private undoredoService: UndoRedoService,
        private grid: GridService,
        public router: Router,
    ) {
        this.toolsController = toolsController;
        this.previewWidth = window.innerWidth * this.widthWorkingZoneRatio;
        this.previewHeight = window.innerHeight;
    }

    disableCursor(): boolean {
        if (!this.toolsController.isCurrentTool(ToolSelector.Etampe)) return false;
        if (this.path == undefined) return true;
        return this.height > this.path.y && 0 < this.path.y && this.width > this.path.x && 0 < this.path.x;
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.resizePreviewCtx = this.resizePreview.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.resizePreviewCtx = this.resizePreviewCtx;
        let imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        for (let i = 0; i < imageData.data.length; i += 1) {
            imageData.data[i] = maxColorValue;
        }
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
        imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.drawingService.drawControlPoints();
        this.undoredoService.addCommand(new ResizeCommand(this.drawingService, this.drawingService.canvas.height, this.drawingService.canvas.width));
        this.grid.drawGrid();
        if ((localStorage.getItem('touche') as string) === 'F5') this.continueDraw();
    }

    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent): void {
        this.toolsController.currentTool.onDoubleClick(event);
    }

    private isMouseOnCornerResize(event: MouseEvent): boolean {
        return (
            event.offsetY <= this.drawingService.baseCtx.canvas.height + this.drawingService.controlPointDiameter / 2 &&
            event.offsetY >= this.drawingService.baseCtx.canvas.height - this.drawingService.controlPointDiameter / 2 &&
            event.offsetX >= this.drawingService.baseCtx.canvas.width - this.drawingService.controlPointDiameter / 2 &&
            event.offsetX <= this.drawingService.baseCtx.canvas.width + this.drawingService.controlPointDiameter / 2
        );
    }

    private isMouseOnButtonResize(event: MouseEvent): boolean {
        return (
            event.offsetY <= this.drawingService.baseCtx.canvas.height + this.drawingService.controlPointDiameter / 2 &&
            event.offsetY >= this.drawingService.baseCtx.canvas.height - this.drawingService.controlPointDiameter / 2 &&
            event.offsetX <= this.drawingService.baseCtx.canvas.width / 2 + this.drawingService.controlPointDiameter / 2 &&
            event.offsetX >= this.drawingService.baseCtx.canvas.width / 2 - this.drawingService.controlPointDiameter / 2
        );
    }

    private isMouseOnRightResize(event: MouseEvent): boolean {
        return (
            event.offsetY <= this.drawingService.baseCtx.canvas.height / 2 + this.drawingService.controlPointDiameter / 2 &&
            event.offsetY >= this.drawingService.baseCtx.canvas.height / 2 - this.drawingService.controlPointDiameter / 2 &&
            event.offsetX <= this.drawingService.baseCtx.canvas.width + this.drawingService.controlPointDiameter / 2 &&
            event.offsetX >= this.drawingService.baseCtx.canvas.width - this.drawingService.controlPointDiameter / 2
        );
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.path = this.toolsController.currentTool.getPositionFromMouse(event);
        this.drawingService.mouseOnCanvas =
            this.drawingService.mouseOnWorkingZone && this.drawingService.isPointsOnCanvas(event.offsetX, event.offsetY);
        if (this.resizing) {
            const mousePosition = this.previewRectangle.getPositionFromMouse(event);
            if (mousePosition.x > this.previewWidth) {
                this.previewWidth = this.previewWidth + this.minVisibleWorkingZone;
            }
            if (mousePosition.y > this.previewHeight) {
                this.previewHeight = this.previewHeight + this.minVisibleWorkingZone;
            }
            if (!this.cornerResize) {
                if (this.rightResize) {
                    mousePosition.y = this.drawingService.canvas.height;
                } else if (this.buttonResize) {
                    mousePosition.x = this.drawingService.canvas.width;
                }
            }

            this.previewRectangle.pathData.push(mousePosition);
            this.resizePreviewCtx.clearRect(0, 0, this.resizePreviewCtx.canvas.width, this.resizePreviewCtx.canvas.height);
            this.previewRectangle.drawRectanglePointiller(this.resizePreviewCtx, this.previewRectangle.pathData);
            this.grid.drawGrid();
        } else {
            if (this.isMouseOnCornerResize(event)) {
                this.cornerResize = true;
            } else if (this.isMouseOnButtonResize(event)) {
                this.buttonResize = true;
            } else if (this.isMouseOnRightResize(event)) {
                this.rightResize = true;
            } else {
                this.cornerResize = false;
                this.rightResize = false;
                this.buttonResize = false;
                this.toolsController.currentTool.onMouseMove(event);
            }
        }
        this.drawingService.drawControlPoints();
    }

    @HostListener('window:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (!this.cornerResize && !this.rightResize && !this.buttonResize) {
            this.toolsController.currentTool.onMouseDown(event);
            this.resizing = false;
        } else if (this.cornerResize || this.rightResize || this.buttonResize) {
            this.resizing = true;
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (!this.resizing) {
            this.toolsController.currentTool.onMouseUp(event);
        } else if (this.resizing) {
            if (this.cornerResize) {
                this.drawingService.resize(event.offsetX, event.offsetY);
                this.undoredoService.addCommand(new ResizeCommand(this.drawingService, event.offsetY, event.offsetX));
            } else if (this.rightResize) {
                this.drawingService.resize(event.offsetX, this.drawingService.height);
                this.undoredoService.addCommand(new ResizeCommand(this.drawingService, this.drawingService.height, event.offsetX));
            } else {
                this.drawingService.resize(this.drawingService.width, event.offsetY);
                this.undoredoService.addCommand(new ResizeCommand(this.drawingService, event.offsetY, this.drawingService.width));
            }
            this.resizing = false;
            this.cornerResize = false;
            this.rightResize = false;
            this.buttonResize = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.resizePreviewCtx.clearRect(0, 0, this.resizePreviewCtx.canvas.width, this.resizePreviewCtx.canvas.height);
            if (this.drawingService.canvas.width + this.minVisibleWorkingZone > this.previewWidth) {
                this.previewWidth = this.resizePreviewCtx.canvas.width + this.minVisibleWorkingZone;
            }
            if (this.drawingService.canvas.height + this.minVisibleWorkingZone > this.previewHeight) {
                this.previewHeight = this.resizePreviewCtx.canvas.height + this.minVisibleWorkingZone;
            }
            this.grid.drawGrid();
            this.drawingService.drawControlPoints();
        }
        localStorage.setItem('data', this.drawingService.convertCanvasToBase64());
        localStorage.setItem('Width', this.baseCanvas.nativeElement.width + 'px');
        localStorage.setItem('Height', this.baseCanvas.nativeElement.height + 'px');
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        this.drawingService.mouseOnWorkingZone = false;
        this.toolsController.currentTool.onMouseLeave(event);
    }

    @HostListener('mouseover', ['$event'])
    onMouseOver(event: MouseEvent): void {
        this.drawingService.mouseOnWorkingZone = true;
        this.toolsController.currentTool.onMouseOver(event);
    }
    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        this.toolsController.currentTool.onMouseOut(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.toolsController.currentTool.onKeyDown(event);
    }
    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolsController.currentTool.onKeyUp(event);
    }
    @HostListener('contextmenu', ['$event'])
    onRightClick(event: MouseEvent): void {
        if (this.drawingService.mouseOnCanvas) {
            event.preventDefault();
        }
    }

    @HostListener('document:keydown.F5', ['$event'])
    onKeydownHandler(e: KeyboardEvent): void {
        localStorage.setItem('touche', 'F5');
    }

    @HostListener('wheel', ['$event'])
    onWindowScroll(event: WheelEvent): void {
        event.preventDefault();
        this.toolsController.currentTool.onWindowScroll(event, this.path);
    }

    continueDraw(): void {
        if (this.router.url !== '/editor') {
            this.router.navigate(['/editor']);
        }
        const imageData = localStorage.getItem('data') as string;
        const image = new Image();
        image.src = imageData as string;
        dimension.x = parseInt(localStorage.getItem('Width') as string, 10);
        dimension.y = parseInt(localStorage.getItem('Height') as string, 10);
        image.onload = () => {
            this.baseCtx.drawImage(image, 0, 0);
            this.drawingService.resizePreviewCtx.clearRect(
                0,
                0,
                this.drawingService.resizePreviewCtx.canvas.width,
                this.drawingService.resizePreviewCtx.canvas.height,
            );
            this.drawingService.drawControlPoints();
        };
    }

    get width(): number {
        return this.canvasSize.x;
    }
    set width(newWidth: number) {
        this.canvasSize.x = newWidth;
    }
    get height(): number {
        return this.canvasSize.y;
    }
    set height(newHeight: number) {
        this.canvasSize.y = newHeight;
    }

    get ToolSelector(): typeof ToolSelector {
        return ToolSelector;
    }
}
