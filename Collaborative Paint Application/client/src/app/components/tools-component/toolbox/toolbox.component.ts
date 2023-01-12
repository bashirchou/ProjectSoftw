import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { ToolType } from 'src/app/Classes/enums/tool-type';
import { ClipboardService } from 'src/app/services/clipboard/clipboard.service';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { DialogOpenerService } from 'src/app/services/dialog-opener-service/dialog-opener.service';
import { DrawingStateService } from 'src/app/services/drawing-state/drawing-state.service';
import { RectangleService } from 'src/app/services/tool-services/rectangle/rectangle.service';
import { SelectionService } from 'src/app/services/tool-services/selection/selection.service';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {

  private toolSelectionShortcuts: Map<string, ToolType>;
  private otherShortcuts: Map<string, () => void>;
  private controlShortcuts: Map<string, () => void>;
  toolTypeRef: typeof ToolType;
  commandInvokerRef: CommandInvokerService;

  @Output() messageEvent: EventEmitter<ToolType>;
  @Output() select: EventEmitter<ToolType>; 

  constructor(
    public drawingState: DrawingStateService,
    public commandInvoker: CommandInvokerService,
    public dialogOpener: DialogOpenerService,
    public rectangleService: RectangleService,
    private clipboard: ClipboardService,
    private selectionService: SelectionService) {
    this.toolSelectionShortcuts = new Map<string, ToolType>();
    this.otherShortcuts = new Map<string, () => void>();
    this.controlShortcuts = new Map<string, () => void>();
    this.toolTypeRef = ToolType;
    this.messageEvent = new EventEmitter<ToolType>();
    this.select = new EventEmitter<ToolType>(); 
    this.select = this.rectangleService.messageEvent; 
    this.setShortcuts();
  }

  ngOnInit(): void {
    this.sendMessage();
  }
  selectionChosen(): void{
  this.drawingState.selectedTool = ToolType.selection; 
  this.sendMessage();
  }
  pencilChosen(): void{
    this.drawingState.selectedTool = ToolType.pencil; 
    this.sendMessage();
  }
  rectangleChosen(): void{
    this.drawingState.selectedTool = ToolType.rectangle; 
    this.sendMessage();
  }
  EllipseChosen(): void{
    this.drawingState.selectedTool = ToolType.ellipse; 
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.drawingState.isBusy()) {
      this.messageEvent.emit(this.drawingState.selectedTool);
      this.selectionService.unselectAll();
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyboardEvent(event: KeyboardEvent): void {
    if (!this.drawingState.isBusy()) {
      if (event.ctrlKey) {
        const controlFunction = this.controlShortcuts.get(event.code);
        if (controlFunction) {
          event.preventDefault();
          controlFunction.call(this);
        }
      } else if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
        const toolType: ToolType | undefined = this.toolSelectionShortcuts.get(event.code);
        if (toolType !== undefined) {
          this.drawingState.selectedTool = toolType;
          this.sendMessage();
        }
        const toCall = this.otherShortcuts.get(event.code);
        if (toCall) {
          toCall.call(this);
        }
      }
    } else {
      event.preventDefault();
    }
  }

  @HostListener('window:keydown.control.z') undo(): void {
    if (!this.drawingState.isBusy()) {
      this.commandInvoker.undo();
      this.selectionService.unselectAll();
    }
  }

  @HostListener('window:keydown.shift.control.z') redo(): void {
    if (!this.drawingState.isBusy()) {
      this.commandInvoker.redo();
      this.selectionService.unselectAll();
    }
  }

  private setShortcuts(): void {
    this.toolSelectionShortcuts
      .set('KeyC', ToolType.pencil)
      .set('Digit1', ToolType.rectangle)
      .set('Digit2', ToolType.ellipse)
      .set('KeyS', ToolType.selection)


    this.otherShortcuts
      .set('Delete', () => this.clipboard.delete());

    this.controlShortcuts
      .set('KeyO', () => this.dialogOpener.openNewDrawingForm())
      .set('KeyG', () => this.dialogOpener.openGallery())
      .set('KeyS', () => this.dialogOpener.openSaving())
      .set('KeyE', () => this.dialogOpener.openExport());
  }
}
