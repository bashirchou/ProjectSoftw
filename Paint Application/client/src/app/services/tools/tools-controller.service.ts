import { Injectable } from '@angular/core';
import { DEFAULT_TOOL, GroupSelector, ToolSelector, toolShorcuts } from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { ToolGroup } from '@app/classes/tool-group';
import { ViewableSidebarItem } from '@app/classes/viewable-sidebar-item';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TexteService } from '@app/services/tools//texte.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { BucketPaintingService } from '@app/services/tools/bucket-painting.service';
import { EllipseService } from '@app/services/tools/ellipse.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { GridService } from '@app/services/tools/grid.service';
import { LineService } from '@app/services/tools/line.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { SelectionService } from '@app/services/tools/selection.service';
import { StampService } from '@app/services/tools/stamp.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { Observer } from 'rxjs';
import { KeyHandlerService } from './key-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsControllerService {
    items: ViewableSidebarItem[] = [];
    currentTool: Tool;
    currentToolSelector: ToolSelector;

    private toolShortcut: Observer<string> = {
        next: (shortcut: string) => {
            const toolSelector = toolShorcuts.get(shortcut);
            if (toolSelector != undefined) {
                this.setCurrentTool(toolSelector);
            }
        },
        error: (err) => console.error('Observer got an error: ' + err),
        complete: () => console.log('Observer got a complete notification'),
    };
    constructor(
        public drawingService: DrawingService,
        private keyHandlerService: KeyHandlerService,
        private undoRedoService: UndoRedoService,
        private gridService: GridService,
    ) {
        const forme = new ToolGroup('Outils de formes', 'add', false, GroupSelector.Shape);
        const rectangle = new RectangleService(this.drawingService, this.undoRedoService);
        const ellipse = new EllipseService(this.drawingService, this.undoRedoService);
        const etampe = new StampService(this.drawingService, this.undoRedoService);
        const polygon = new PolygonService(this.drawingService, this.undoRedoService);
        const aerosol = new AerosolService(this.drawingService, this.undoRedoService);
        const eraser = new EraserService(this.drawingService, this.undoRedoService);
        const bucket = new BucketPaintingService(this.drawingService, this.undoRedoService);
        const texte = new TexteService(this.drawingService, keyHandlerService, this.undoRedoService);
        // tslint:disable-next-line: max-line-length

        const selectionRectangle = new SelectionService(this.drawingService, this.keyHandlerService, this.gridService, this.undoRedoService);

        forme.addTool(rectangle);
        forme.addTool(polygon);
        forme.addTool(ellipse);
        this.addItem(new PencilService(this.drawingService, this.undoRedoService));
        this.addItem(forme);
        this.addItem(new LineService(this.drawingService, this.undoRedoService));
        this.addItem(eraser);
        this.addItem(selectionRectangle);
        this.addItem(aerosol);
        this.addItem(new PipetteService(this.drawingService));
        this.addItem(bucket);
        this.addItem(texte);
        this.addItem(etampe);
        this.setCurrentTool(DEFAULT_TOOL);
        this.addShortcutToolsListener();
    }
    addShortcutToolsListener(): void {
        for (const tuple of toolShorcuts) {
            // tslint:disable-next-line: deprecation
            this.keyHandlerService.getObservableFromShortcut(tuple[0]).subscribe(this.toolShortcut);
        }
    }
    addItem(item: ViewableSidebarItem): void {
        this.items.push(item);
    }

    setCurrentTool(toolSelector: ToolSelector): void {
        this.items.forEach((item) => {
            if (item.groupSelector !== GroupSelector.NotAGroup) {
                const group = item as ToolGroup;
                if (group.tools.has(toolSelector)) {
                    this.currentTool = group.getTool(toolSelector);
                    this.currentToolSelector = toolSelector;
                }
            } else {
                const tool = item as Tool;
                if (tool.toolSelector === toolSelector) {
                    this.currentTool = tool;
                    this.currentToolSelector = toolSelector;
                }
            }
        });
    }

    getGroup(index: number): ToolGroup {
        if (index < 0 || index >= this.items.length) {
            throw new RangeError('Index out of bound exception');
        } else if (this.items[index].groupSelector === GroupSelector.NotAGroup) {
            throw new Error('This is not a ToolGroup. It is a tool');
        }
        return this.items[index] as ToolGroup;
    }

    isCurrentTool(toolSelector: ToolSelector): boolean {
        if (toolSelector === this.currentToolSelector) {
            return true;
        }
        return false;
    }

    isCurrentToolInGroup(index: number): boolean {
        if (index < 0 || index >= this.items.length) {
            return false;
        } else if (this.items[index].groupSelector === GroupSelector.NotAGroup) {
            return false;
        }
        return (this.items[index] as ToolGroup).tools.has(this.currentToolSelector);
    }
    getTool(toolSelector: ToolSelector): Tool {
        for (const item of this.items) {
            if (item.groupSelector === GroupSelector.NotAGroup) {
                const tool = item as Tool;
                if (tool.toolSelector === toolSelector) {
                    return tool;
                }
            } else {
                const group = item as ToolGroup;
                if (group.tools.has(toolSelector)) {
                    return group.getTool(toolSelector);
                }
            }
        }
        throw new Error('The tool do not exist in the tool controler');
    }
}
