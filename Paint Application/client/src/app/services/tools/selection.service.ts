import { Injectable } from '@angular/core';
import { ArrowDirection } from '@app/classes/arrow-direction';
import { ControlPointLocation, MouseButton, SelectorType, selectorTypeString, ToolSelector } from '@app/classes/constant';
import { Tracer } from '@app/classes/tracer';
import { SelectionCommand } from '@app/classes/undoredoCommands/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services//drawing/drawing.service';
import { KeyDisplacementService } from '@app/services//selection-function/keydisplacement.service';
import { LimitAssignService } from '@app/services//selection-function/limit-assign.service';
import { PolygonalService } from '@app/services//selection-function/polygonal.service';
import { SelectionDrawingService } from '@app/services//selection-function/selection-drawing.service';
import { GridService } from '@app/services/tools/grid.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

// tslint:disable:max-file-line-count
// tslint:disable:cyclomatic-complexity
@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tracer {
    private imageCtx: CanvasRenderingContext2D;
    private imageCanvas: HTMLCanvasElement;
    private clipImage: ImageData = new ImageData(1, 1);
    private pathData: Vec2[] = [];
    private linePath: Vec2[] = [];
    private resizelinePath: Vec2[] = [];
    isCopied: boolean = false;
    private width: number = 0;
    private height: number = 0;
    private resizeWidth: number = 0;
    private resizeHeight: number = 0;
    private dwidth: number = 0;
    private dheight: number = 0;
    private scaleXSign: number = 1;
    private scaleYSign: number = 1;
    selected: boolean = false;
    private signWidth: number = 1;
    private signHeight: number = 1;
    private canMove: boolean = false;
    private timerDisabled: boolean = true;
    private timer100Disabled: boolean = true;
    private initialPoint: Vec2 = { x: 0, y: 0 };
    private lowerLimit: Vec2 = { x: 0, y: 0 };
    private upperLimit: Vec2 = { x: 0, y: 0 };
    private isPerfect: boolean = false;
    private ajustementVec: Vec2 = { x: 0, y: 0 };
    private onControlPoint: boolean = false;
    selectorType: SelectorType = SelectorType.Rectangle;
    private controlPointLocation: ControlPointLocation;
    private arrowDirection: ArrowDirection = { r: false, l: false, u: false, d: false };
    isMagnetisme: boolean = false;
    private nClickLine: number = 0;
    private lastPoint: Vec2 = { x: 0, y: 0 };
    private AJUSTEMENT_CP: number = 30;
    private keyDisplacementService: KeyDisplacementService;
    private selectionDrawingService: SelectionDrawingService;
    private limitAssignService: LimitAssignService;
    private polygonalService: PolygonalService;
    constructor(
        drawingService: DrawingService,
        private keyHandlerService: KeyHandlerService,
        private gridService: GridService,
        private undoredoService: UndoRedoService,
    ) {
        super(drawingService, ToolSelector.Selector, 'crop_free', false, 'Selector', 'c');
        this.keyDisplacementService = new KeyDisplacementService();
        this.selectionDrawingService = new SelectionDrawingService();
        this.limitAssignService = new LimitAssignService(gridService);
        this.polygonalService = new PolygonalService();
        this.clearPath();
        this.selectorType = SelectorType.Rectangle;

        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('r').subscribe(() => {
            this.selectorType = SelectorType.Rectangle;
        });
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('s').subscribe(() => {
            this.selectorType = SelectorType.Ellipse;
        });
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('control a').subscribe(() => {
            // tslint:disable-next-line: deprecation
            this.selectorType = SelectorType.All;
        });
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('v').subscribe(() => {
            this.selectorType = SelectorType.Polygonal;
        });

        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('control v').subscribe(() => {
            this.paste();
        });

        this.keyHandlerService.getObservableFromShortcut('control c').subscribe(() => {
            this.copied();
        });

        this.keyHandlerService.getObservableFromShortcut('control x').subscribe(() => {
            this.cut();
        });
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut('m').subscribe(() => {
            if (!this.isMagnetisme) {
                this.isMagnetisme = true;
            } else {
                this.isMagnetisme = false;
            }
        });
        // tslint:disable-next-line: deprecation

        this.keyHandlerService.getObservableFromShortcut('ArrowRight').subscribe({
            next: (shortCut: string) => {
                if (this.isMagnetisme) {
                    this.drawWithArrow(this.gridService.squareDimensionPixel, shortCut);
                }
            },
        });

        // tslint:disable-next-line: deprecation

        this.keyHandlerService.getObservableFromShortcut('ArrowLeft').subscribe({
            next: (shortCut: string) => {
                if (this.isMagnetisme) {
                    this.drawWithArrow(-this.gridService.squareDimensionPixel, shortCut);
                }
            },
        });

        // tslint:disable-next-line: deprecation

        this.keyHandlerService.getObservableFromShortcut('ArrowUp').subscribe({
            next: (shortCut: string) => {
                if (this.isMagnetisme) {
                    this.drawWithArrow(-this.gridService.squareDimensionPixel, shortCut);
                }
            },
        });

        // tslint:disable-next-line: deprecation

        this.keyHandlerService.getObservableFromShortcut('ArrowDown').subscribe({
            next: (shortCut: string) => {
                if (this.isMagnetisme) {
                    this.drawWithArrow(this.gridService.squareDimensionPixel, shortCut);
                }
            },
        });

        this.imageCanvas = document.createElement('canvas');
        this.imageCtx = this.imageCanvas.getContext('2d') as CanvasRenderingContext2D;
    }
    drawWithArrow(gridSize: number, arrowDirection: string): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.limitAssignService.adaptedAssignationMagetismeArrow(this.lowerLimit, this.upperLimit, gridSize, arrowDirection);

        this.drawSelectedForm(this.drawingService.previewCtx, this.lowerLimit.x, this.lowerLimit.y);

        this.selectionDrawingService.drawBorder(
            this.drawingService.previewCtx,
            this.lowerLimit,
            this.upperLimit,
            this.thickness,
            this.selectorType,
            this.pathData,
        );
    }
    selectionToString(selectorType: SelectorType): string {
        const selection = selectorTypeString.get(selectorType);
        if (selection == undefined) throw new Error('Invalid selection Type');
        return selection;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.drawingService.enableSelect();
            const mousePosition = this.getPositionFromMouse(event);
            if (this.selected) {
                if (
                    mousePosition.x > this.lowerLimit.x + this.AJUSTEMENT_CP &&
                    mousePosition.y > this.lowerLimit.y + this.AJUSTEMENT_CP &&
                    mousePosition.x < this.upperLimit.x - this.AJUSTEMENT_CP &&
                    mousePosition.y < this.upperLimit.y - this.AJUSTEMENT_CP
                ) {
                    this.onControlPoint = false;
                    this.ajustementVec = { x: mousePosition.x - this.lowerLimit.x, y: mousePosition.y - this.lowerLimit.y };
                    this.drawSelectedForm(
                        this.drawingService.previewCtx,
                        mousePosition.x - this.ajustementVec.x,
                        mousePosition.y - this.ajustementVec.y,
                    );
                    this.selectionDrawingService.drawBorder(
                        this.drawingService.previewCtx,
                        this.lowerLimit,
                        this.upperLimit,
                        this.thickness,
                        this.selectorType,
                        this.linePath,
                    );
                } else if (
                    this.limitAssignService.controlPointVerification(mousePosition, this.lowerLimit, this.upperLimit, this.width, this.height) !==
                    ControlPointLocation.none
                ) {
                    this.controlPointLocation = this.limitAssignService.controlPointVerification(
                        mousePosition,
                        this.lowerLimit,
                        this.upperLimit,
                        this.width,
                        this.height,
                    );
                    this.onControlPoint = true;
                    this.resizelinePath = this.polygonalService.linePathAssign(this.linePath);
                    this.resizeWidth = this.dwidth;
                    this.resizeHeight = this.dheight;
                } else {
                    this.drawSelectedForm(this.drawingService.baseCtx, this.lowerLimit.x, this.lowerLimit.y);
                    this.initialize(mousePosition);
                }
            } else if (this.selectorType === SelectorType.Polygonal && !this.polygonalService.isIntersect(mousePosition, this.linePath)) {
                this.polygonalCommand(mousePosition, event);
            } else {
                this.initialPoint = mousePosition;
            }
        }
    }

    polygonalCommand(mousePosition: Vec2, event: MouseEvent): void {
        if (this.drawingService.mouseOnCanvas) {
            this.nClickLine++;
        }
        if (this.nClickLine === 1 && this.drawingService.mouseOnCanvas) {
            this.drawingService.saveCanvas();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.initialPoint = mousePosition;
            this.linePath.push(this.mouseDownCoord);
        } else if (this.nClickLine > 1 && this.drawingService.mouseOnCanvas) {
            const xSide = mousePosition.x - this.initialPoint.x;
            const ySide = mousePosition.y - this.initialPoint.y;
            const NUMBER_PIXEL = 20;
            const NUMBER_CLICK_MAX = 3;
            if (Math.sqrt(xSide * xSide + ySide * ySide) <= NUMBER_PIXEL && this.nClickLine >= NUMBER_CLICK_MAX) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.selectedRectangle(this.drawingService.previewCtx, this.linePath);
                this.nClickLine = 0;
                this.clearPath();
            } else {
                this.mouseDownCoord = this.lastPoint;
                this.linePath.push(this.mouseDownCoord);
                this.pathData.push(this.mouseDownCoord);
                if (!this.isPerfect) {
                    this.lastPoint = this.pathData[this.pathData.length - 1];
                    this.polygonalService.drawLine(this.drawingService.baseCtx, this.pathData);
                } else {
                    this.lastPoint = this.polygonalService.LineDegreeFix(this.drawingService.baseCtx, this.pathData);
                }
                this.clearPath();
            }
        }
    }
    initialize(mousePosition: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.initialPoint = mousePosition;
        this.linePath = [];
        this.drawingService.baseCtx.save();
        this.scaleXSign = 1;
        this.scaleYSign = 1;
        this.selected = false;
    }
    // Appliquer undoredo ici
    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.undoredoService.addCommand(
                new SelectionCommand(
                    this.drawingService,
                    this,
                    this.pathData,
                    { ...this.lowerLimit },
                    this.width,
                    this.height,
                    this.dwidth,
                    this.dheight,
                    this.selectorType,
                ),
            );
            if (!this.selected && this.pathData.length > 1 && this.width !== 0 && this.selectorType !== SelectorType.Polygonal && this.height !== 0) {
                this.selectedRectangle(this.drawingService.previewCtx, this.pathData);
                this.clearPath();
            } else if (this.selected && this.selectorType !== SelectorType.Polygonal) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                const mousePosition = this.getPositionFromMouse(event);

                this.drawingCommand(this.positionSelectionMagnetism(mousePosition));
                this.selectionDrawingService.drawBorder(
                    this.drawingService.previewCtx,
                    this.lowerLimit,
                    this.upperLimit,
                    this.thickness,
                    this.selectorType,
                    this.linePath,
                );
            }

            const negative = -1;
            if (this.lowerLimit.x > this.upperLimit.x) {
                const tempLX = this.lowerLimit.x;
                this.lowerLimit.x = this.upperLimit.x;
                this.upperLimit.x = tempLX;
                this.scaleXSign *= negative;
                this.dwidth *= negative;
            }
            if (this.lowerLimit.y > this.upperLimit.y) {
                const tempLY = this.lowerLimit.y;
                this.lowerLimit.y = this.upperLimit.y;
                this.upperLimit.y = tempLY;
                this.scaleYSign *= negative;
                this.dheight *= negative;
            }
        }
        this.mouseDown = false;
    }

    drawingCommand(mousePosition: Vec2): void {
        if (this.onControlPoint) {
            let baseX = mousePosition.x - this.resizeWidth;
            let baseY = mousePosition.y - this.resizeHeight;
            let width = this.resizeWidth;
            let height = this.resizeHeight;

            switch (this.controlPointLocation) {
                case ControlPointLocation.topRight:
                    height = -this.resizeHeight;
                    this.dwidth = mousePosition.x - this.lowerLimit.x;
                    this.dheight = this.upperLimit.y - mousePosition.y;
                    this.upperLimit.x = mousePosition.x;
                    this.lowerLimit.y = mousePosition.y;
                    baseX = this.lowerLimit.x;
                    baseY = this.upperLimit.y;
                    break;

                case ControlPointLocation.topLeft:
                    width = -this.resizeWidth;
                    height = -this.resizeHeight;
                    this.dwidth = this.upperLimit.x - mousePosition.x;
                    this.dheight = this.upperLimit.y - mousePosition.y;
                    this.lowerLimit.x = mousePosition.x;
                    this.lowerLimit.y = mousePosition.y;
                    baseX = this.upperLimit.x;
                    baseY = this.upperLimit.y;
                    break;
                case ControlPointLocation.bottomRight:
                    this.dwidth = mousePosition.x - this.lowerLimit.x;
                    this.dheight = mousePosition.y - this.lowerLimit.y;
                    this.upperLimit.x = mousePosition.x;
                    this.upperLimit.y = mousePosition.y;
                    baseX = this.lowerLimit.x;
                    baseY = this.lowerLimit.y;
                    break;
                case ControlPointLocation.bottomLeft:
                    width = -this.resizeWidth;

                case ControlPointLocation.bottomLeft:
                    this.dwidth = this.upperLimit.x - mousePosition.x;
                    this.dheight = mousePosition.y - this.lowerLimit.y;
                    this.lowerLimit.x = mousePosition.x;
                    this.upperLimit.y = mousePosition.y;
                    baseX = this.upperLimit.x;
                    baseY = this.lowerLimit.y;
                    break;
                case ControlPointLocation.middleTop:
                    height = -this.resizeHeight;
                    this.dheight = this.upperLimit.y - mousePosition.y;
                    this.lowerLimit.y = mousePosition.y;
                    baseY = this.upperLimit.y;
                    break;
                case ControlPointLocation.middleLeft:
                    width = -this.resizeWidth;
                    this.dwidth = this.upperLimit.x - mousePosition.x;
                    this.lowerLimit.x = mousePosition.x;
                    baseX = this.upperLimit.x;
                    break;
                case ControlPointLocation.middleRight:
                    this.dwidth = mousePosition.x - this.lowerLimit.x;
                    this.upperLimit.x = mousePosition.x;
                    baseX = this.lowerLimit.x;
                    break;
                case ControlPointLocation.middleBottom:
                    this.dheight = mousePosition.y - this.lowerLimit.y;
                    this.upperLimit.y = mousePosition.y;
                    baseY = this.lowerLimit.y;
                    break;
            }
            if (this.isPerfect) {
                this.perfectShape();
            }
            this.drawSelectedForm(this.drawingService.previewCtx, this.lowerLimit.x, this.lowerLimit.y);
            if (this.selectorType === SelectorType.Polygonal) {
                this.limitAssignService.resizedAssignPolygonal(
                    mousePosition,
                    { x: baseX, y: baseY },
                    width,
                    height,
                    this.linePath,
                    this.resizelinePath,
                );
            }
        } else {
            if (!this.isMagnetisme) {
                this.drawSelectedForm(this.drawingService.previewCtx, mousePosition.x - this.ajustementVec.x, mousePosition.y - this.ajustementVec.y);
                this.limitAssignService.pathdAssignationPolygonal(
                    this.lowerLimit.x,
                    this.lowerLimit.y,
                    mousePosition.x - this.ajustementVec.x,
                    mousePosition.y - this.ajustementVec.y,
                    this.linePath,
                );
                this.limitAssignService.adaptedAssignation(mousePosition, this.lowerLimit, this.upperLimit, this.ajustementVec);
            } else {
                this.limitAssignService.adaptedAssignationMagetisme(this.lowerLimit, this.upperLimit, this.ajustementVec, mousePosition);
                this.drawSelectedForm(this.drawingService.previewCtx, this.lowerLimit.x, this.lowerLimit.y);
            }
        }
    }
    perfectShape(): void {
        if (Math.abs(this.dheight) >= Math.abs(this.dwidth)) {
            this.dheight = (this.dwidth * (this.dheight * this.dwidth)) / Math.abs(this.dheight * this.dwidth);
        } else {
            this.dwidth = (this.dheight * (this.dheight * this.dwidth)) / Math.abs(this.dheight * this.dwidth);
        }

        this.limitAssignService.resizeAssignation(this.lowerLimit, this.upperLimit, this.dwidth, this.dheight);
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        if (this.nClickLine > 0 && this.selectorType === SelectorType.Polygonal && this.drawingService.mouseOnCanvas && !this.selected) {
            this.pathData[0] = this.mouseDownCoord;
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (!this.isPerfect && !this.polygonalService.isIntersect(mousePosition, this.linePath)) {
                this.lastPoint = this.pathData[this.pathData.length - 1];
                this.polygonalService.drawLine(this.drawingService.previewCtx, this.pathData);
            } else if (!this.polygonalService.isIntersect(mousePosition, this.linePath)) {
                this.lastPoint = this.polygonalService.LineDegreeFix(this.drawingService.previewCtx, this.pathData);
            }
        } else if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            if (!this.selected && this.selectorType !== SelectorType.Polygonal) {
                this.pathData.push(mousePosition);
                this.selectionRectangle(this.drawingService.previewCtx, this.pathData);
            } else if (this.selected) {
                this.drawingCommand(this.positionSelectionMagnetism(mousePosition));

                this.selectionDrawingService.drawBorder(
                    this.drawingService.previewCtx,
                    this.lowerLimit,
                    this.upperLimit,
                    this.thickness,
                    this.selectorType,
                    this.linePath,
                );
            }
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.clearPath();
    }
    onMouseOver(event: MouseEvent): void {
        this.clearPath();
    }
    selectionSquare(): void {
        if (this.height >= this.width) {
            this.dheight = this.height = (this.width * (this.height * this.width)) / Math.abs(this.height * this.width);
        } else {
            this.dwidth = this.width = (this.height * (this.height * this.width)) / Math.abs(this.height * this.width);
        }
        this.pathData[this.pathData.length - 1].x = this.pathData[0].x + this.width;
        this.pathData[this.pathData.length - 1].y = this.pathData[0].y + this.height;
    }
    drawSelectedForm(ctx: CanvasRenderingContext2D, positionX: number, positionY: number): void {
        ctx.save();
        ctx.beginPath();
        if (this.selectorType === SelectorType.Ellipse) {
            ctx.ellipse(
                positionX + this.dwidth / 2,
                positionY + this.dheight / 2,
                Math.abs(this.dwidth / 2),
                Math.abs(this.dheight / 2),
                Math.PI,
                0,
                2 * Math.PI,
            );
            ctx.clip();
        } else if (this.selectorType === SelectorType.Polygonal) {
            for (const point of this.linePath) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
            ctx.clip();
        }

        let scaleXSignTemp = 1;
        let scaleYSignTemp = 1;
        if (this.dwidth < 0) {
            scaleXSignTemp = -scaleXSignTemp;
        }
        if (this.dheight < 0) {
            scaleYSignTemp = -scaleXSignTemp;
        }

        ctx.scale(scaleXSignTemp * this.scaleXSign, scaleYSignTemp * this.scaleYSign);
        ctx.drawImage(
            this.imageCanvas,
            this.initialPoint.x,
            this.initialPoint.y,
            this.width * this.signWidth,
            this.height * this.signHeight,
            positionX * scaleXSignTemp * this.scaleXSign,
            positionY * scaleYSignTemp * this.scaleYSign,
            this.dwidth * scaleXSignTemp * this.scaleXSign,
            this.dheight * scaleYSignTemp * this.scaleYSign,
        );
        ctx.restore();
    }
    selectionRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (this.selectorType === SelectorType.All) {
            this.width = this.dwidth = this.drawingService.canvas.width - 1;
            this.height = this.dheight = this.drawingService.canvas.height - 1;
            path.push({ x: this.width, y: this.height });
            path.push({ x: this.width, y: this.height });
            path[0] = { x: 0, y: 0 };
        } else {
            ctx.lineWidth = 1;
            this.drawingService.previewCtx.beginPath();
            const dotedPatern = 6;
            this.width = this.dwidth = path[path.length - 1].x - path[0].x;
            this.height = this.dheight = path[path.length - 1].y - path[0].y;
            if (this.isPerfect) {
                this.selectionSquare();
            }
            ctx.setLineDash([dotedPatern]);
            if (this.selectorType === SelectorType.Ellipse) {
                ctx.ellipse(
                    path[0].x + this.width / 2,
                    path[0].y + this.height / 2,
                    Math.abs(this.width + 2) / 2,
                    Math.abs(this.height + 2) / 2,
                    Math.PI,
                    0,
                    2 * Math.PI,
                );
                ctx.stroke();
            }
            ctx.strokeRect(path[0].x, path[0].y, this.width, this.height);
            ctx.setLineDash([0]);
        }
    }
    selectedRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        if (this.selected === false) {
            this.selected = true;
        }
        this.limitAssignService.limitAssignation(path, this.lowerLimit, this.upperLimit, this.selectorType);
        if (this.selectorType === SelectorType.Polygonal) {
            this.drawingService.restoreCanvas();
            this.dwidth = this.width = this.upperLimit.x - this.lowerLimit.x;
            this.dheight = this.height = this.upperLimit.y - this.lowerLimit.y;
            this.signWidth = this.signHeight = 1;
            this.initialPoint.x = this.lowerLimit.x;
            this.initialPoint.y = this.lowerLimit.y;
        } else if (this.selectorType === SelectorType.All) {
            this.initialPoint.x = 0;
            this.initialPoint.y = 0;
        } else {
            this.signWidth = this.width / Math.abs(this.width);
            this.signHeight = this.height / Math.abs(this.height);
            this.height *= this.signHeight;
            this.width *= this.signWidth;
            this.dheight *= this.signHeight;
            this.dwidth *= this.signWidth;
        }
        this.imageCanvas.width = this.drawingService.canvas.width;
        this.imageCanvas.height = this.drawingService.canvas.height;
        this.imageCtx.drawImage(this.drawingService.canvas, 0, 0, this.imageCanvas.width, this.imageCanvas.height);

        this.selectionDrawingService.clearFirstTime(
            this.drawingService.baseCtx,
            this.selectorType,
            this.signWidth,
            this.signHeight,
            this.linePath,
            this.lowerLimit,
            this.width,
            this.height,
        );
        this.drawSelectedForm(this.drawingService.previewCtx, this.lowerLimit.x, this.lowerLimit.y);
        this.selectionDrawingService.drawBorder(ctx, this.lowerLimit, this.upperLimit, this.thickness, this.selectorType, path);
    }
    onKeyUp(event: KeyboardEvent): void {
        this.canMove = false;
        this.timerDisabled = true;
        if (!event.shiftKey) {
            this.isPerfect = false;
            if (this.mouseDown && this.selectorType !== SelectorType.Polygonal && !this.selected) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.selectionRectangle(this.drawingService.previewCtx, this.pathData);
            } else if (this.selectorType !== SelectorType.Polygonal && !this.selected) {
                if (this.pathData.length > 1 && this.width !== 0 && this.height !== 0) {
                    this.selectedRectangle(this.drawingService.previewCtx, this.pathData);
                }
            }
        }
        this.keyDisplacementService.arrowKeyAssignation(event, false, this.arrowDirection);
        if (event.key === 'Escape') {
            if (this.selectorType !== SelectorType.Polygonal) {
                this.selected = false;
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            } else if (this.nClickLine >= 1) {
                this.drawingService.restoreCanvas();
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.linePath = [];
                this.pathData = [];
                this.nClickLine = 0;
            }
        } else if (event.key === 'Backspace' && this.selectorType === SelectorType.Polygonal) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.restoreCanvas();
            this.linePath.pop();
            this.polygonalService.drawSelectedLine(this.drawingService.baseCtx, this.linePath);
            this.mouseDownCoord = this.linePath[this.linePath.length - 1];
        }
    }
    arrowInit(addX: number, addY: number): void {
        if (this.timer100Disabled) {
            this.canMove = false;
            this.timer100Disabled = false;
            this.canMove = this.keyDisplacementService.timer100ms();
        } else if (this.canMove) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.drawSelectedForm(this.drawingService.previewCtx, (this.lowerLimit.x += addX), (this.lowerLimit.y += addY));
            this.upperLimit.x += addX;
            this.upperLimit.y += addY;
            this.selectionDrawingService.drawBorder(
                this.drawingService.previewCtx,
                this.lowerLimit,
                this.upperLimit,
                this.thickness,
                this.selectorType,
                this.linePath,
            );
            this.timer100Disabled = true;
        }
    }
    arrowLogic(): void {
        const PIXEL_TRANSLATION = 3;
        this.arrowInit(
            PIXEL_TRANSLATION * (Number(this.arrowDirection.r) - Number(this.arrowDirection.l)),
            PIXEL_TRANSLATION * (Number(this.arrowDirection.d) - Number(this.arrowDirection.u)),
        );
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.timerDisabled) {
            this.timerDisabled = false;
            this.canMove = this.keyDisplacementService.timer();
        } else if (this.canMove) {
            this.arrowLogic();
            this.keyDisplacementService.arrowKeyAssignation(event, true, this.arrowDirection);
        }
        if (event.shiftKey === true) {
            this.isPerfect = true;
            this.shiftedDrawing();
        }
    }
    shiftedDrawing(): void {
        if (this.mouseDown && !this.onControlPoint && !this.selected) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectionRectangle(this.drawingService.previewCtx, this.pathData);
        } else if (!this.onControlPoint && !this.selected) {
            if (this.pathData.length > 1 && this.width !== 0 && this.height !== 0) {
                this.selectedRectangle(this.drawingService.previewCtx, this.pathData);
            }
        }
    }

    onGridSelection(mousePosition: { x: number; y: number }): void {
        const squareDimensionPixelInternal: number = this.gridService.squareDimensionPixel;
        if (mousePosition.x % squareDimensionPixelInternal >= squareDimensionPixelInternal / 2) {
            mousePosition.x = mousePosition.x + (squareDimensionPixelInternal - (mousePosition.x % squareDimensionPixelInternal));
        } else if (mousePosition.x % squareDimensionPixelInternal < squareDimensionPixelInternal / 2) {
            mousePosition.x = mousePosition.x - (mousePosition.x % squareDimensionPixelInternal);
        }

        if (mousePosition.y % squareDimensionPixelInternal >= squareDimensionPixelInternal / 2) {
            mousePosition.y = mousePosition.y + (squareDimensionPixelInternal - (mousePosition.y % squareDimensionPixelInternal));
        } else if (mousePosition.y % squareDimensionPixelInternal < squareDimensionPixelInternal / 2) {
            mousePosition.y = mousePosition.y - (mousePosition.y % squareDimensionPixelInternal);
        }
    }

    positionSelectionMagnetism(mousePosition: { x: number; y: number }): { x: number; y: number } {
        if (this.isMagnetisme) {
            if (this.onControlPoint) {
                this.onGridSelection(mousePosition);
            }
        }
        return { x: mousePosition.x - 1, y: mousePosition.y - 1 };
    }

    copied(): void {
        if (this.selected) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelectedForm(this.drawingService.previewCtx, this.lowerLimit.x, this.lowerLimit.y);
            this.clipImage = this.drawingService.previewCtx.getImageData(this.lowerLimit.x, this.lowerLimit.y, this.dwidth, this.dheight);
            this.selectionDrawingService.drawBorder(
                this.drawingService.previewCtx,
                this.lowerLimit,
                this.upperLimit,
                this.thickness,
                this.selectorType,
                this.linePath,
            );
            this.isCopied = true;
        }
    }
    paste(): void {
        if (this.isCopied) {
            this.drawingService.baseCtx.putImageData(this.clipImage, 0, 0);
        }
    }
    cut(): void {
        this.copied();
        this.delete();
    }
    delete(): void {
        if (this.selected) {
            this.drawingService.baseCtx.fillStyle = 'white';
            this.drawingService.previewCtx.fillStyle = 'white';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.baseCtx.fillRect(this.lowerLimit.x, this.lowerLimit.y, this.dwidth, this.dheight);
            this.selected = false;
        }
    }
    clearPath(): void {
        this.pathData = [];
    }
}
