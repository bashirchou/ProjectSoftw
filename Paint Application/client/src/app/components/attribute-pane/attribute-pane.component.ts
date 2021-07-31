import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GroupSelector, ToolSelector } from '@app/classes/constant';
import { Shape } from '@app/classes/shape';
import { Tool } from '@app/classes/tool';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TexteService } from '@app/services/tools//texte.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { BucketPaintingService } from '@app/services/tools/bucket-painting.service';
import { GridService } from '@app/services/tools/grid.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { LineService } from '@app/services/tools/line.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import { SelectionService } from '@app/services/tools/selection.service';
import { StampService } from '@app/services/tools/stamp.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';

@Component({
    selector: 'app-attribut-pane',
    templateUrl: './attribute-pane.component.html',
    styleUrls: ['./attribute-pane.component.scss'],
})
export class AttributePaneComponent implements AfterViewInit {
    toolsController: ToolsControllerService;
    @ViewChild('zoomCanvas', { static: false }) zoomCanvas: ElementRef<HTMLCanvasElement>;

    constructor(
        toolsControllerService: ToolsControllerService,
        public keyHandlerService: KeyHandlerService,
        public grid: GridService,
        public dialog: MatDialog,
        public drawingService: DrawingService,
    ) {
        this.toolsController = toolsControllerService;
    }

    ngAfterViewInit(): void {
        const pipetteTool = this.toolsController.getTool(ToolSelector.Pipette) as PipetteService;
        pipetteTool.zoomCtx = this.zoomCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        pipetteTool.zoomCanvas = this.zoomCanvas.nativeElement;
    }
    openDialog(): void {
        this.dialog.open(ColorPickerComponent, { height: '80%', width: '60%' });
    }
    // tslint:disable-next-line: no-any
    setMyStyle(): any {
        return {
            background: 'linear-gradient(90deg,' + this.drawingService.primaryColor + ' 50%,' + this.drawingService.secondaryColor + ' 50%)',
        };
    }

    // NEEDED FOR THE HTML---------------
    get GroupSelector(): typeof GroupSelector {
        return GroupSelector;
    }

    get ToolSelector(): typeof ToolSelector {
        return ToolSelector;
    }

    get Shape(): typeof Shape {
        return Shape;
    }
    get minThickness(): number {
        return Tool.minThickness;
    }
    get maxThickness(): number {
        return Tool.maxThickness;
    }

    get minDiameter(): number {
        return LineService.minDiameter;
    }
    get maxDiameter(): number {
        return LineService.maxDiameter;
    }

    get minEmission(): number {
        return AerosolService.minEmission;
    }

    get maxEmission(): number {
        return AerosolService.maxEmission;
    }

    get minJetDiameter(): number {
        return AerosolService.minJetDiameter;
    }

    get maxJetDiameter(): number {
        return AerosolService.maxJetDiameter;
    }

    get minGoutteDiameter(): number {
        return AerosolService.minGoutteDiameter;
    }

    get maxGoutteDiameter(): number {
        return AerosolService.maxGoutteDiameter;
    }

    get minColorTolerance(): number {
        return BucketPaintingService.minColorTolerance;
    }

    get maxColorTolerance(): number {
        return BucketPaintingService.maxColorTolerance;
    }

    getShape(): Shape {
        if (this.toolsController.currentTool instanceof Shape) {
            return this.toolsController.currentTool as Shape;
        }
        throw new Error('The current tool is not a Shape');
    }

    getLine(): LineService {
        if (this.toolsController.currentTool instanceof LineService) {
            return this.toolsController.currentTool as LineService;
        }
        throw new Error('The current tool is not a LineService');
    }
    getPolygon(): PolygonService {
        if (this.toolsController.currentTool instanceof PolygonService) {
            return this.toolsController.currentTool as PolygonService;
        }
        throw new Error('The current tool is not a polygone.');
    }
    getStamp(): StampService {
        if (this.toolsController.currentTool instanceof StampService) {
            return this.toolsController.currentTool as StampService;
        }
        throw new Error('The current tool is not a stamp.');
    }
    getPipette(): PipetteService {
        if (this.toolsController.currentTool instanceof PipetteService) {
            return this.toolsController.currentTool as PipetteService;
        }
        throw new Error('The current tool is not a PipetteService');
    }
    getSelector(): SelectionService {
        if (this.toolsController.currentTool instanceof SelectionService) {
            return this.toolsController.currentTool as SelectionService;
        }
        throw new Error('The current tool is not a selector.');
    }

    getAerosol(): AerosolService {
        if (this.toolsController.currentTool instanceof AerosolService) {
            return this.toolsController.currentTool as AerosolService;
        }
        throw new Error('The current tool is not a Aerosol.');
    }

    getTextService(): TexteService {
        if (this.toolsController.currentTool instanceof TexteService) {
            return this.toolsController.currentTool as TexteService;
        }
        throw new Error('The current tool is not a Aerosol.');
    }

    getBucket(): BucketPaintingService {
        if (this.toolsController.currentTool instanceof BucketPaintingService) {
            return this.toolsController.currentTool as BucketPaintingService;
        }
        throw new Error('The current tool is not a BucketPaintingService.');
    }

    formatLabelNumber(value: number): number {
        return value;
    }
    // -------------------------------

    // tslint:disable-next-line: no-any
    toggleChange(event: any, variant: string): void {
        const toggle = event.source;
        if (toggle) {
            const group = toggle.buttonToggleGroup;
            // tslint:disable-next-line: no-any
            if (event.value.some((item: any) => item === toggle.value)) {
                group.value = [toggle.value];
                if (variant === 'bold') {
                    this.getTextService().isBold = true;
                }
                if (variant === 'italic') {
                    this.getTextService().isItalic = true;
                }
            }
        } else {
            if (variant === 'bold') {
                this.getTextService().isBold = false;
            }
            if (variant === 'italic') {
                this.getTextService().isItalic = false;
            }
        }
    }
}
