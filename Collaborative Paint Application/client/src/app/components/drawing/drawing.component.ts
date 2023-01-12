import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Coord } from 'src/app/Classes/coord';
import { CoordExtractor } from 'src/app/Classes/coord-extractor';
import { KeyBoardInteractable } from 'src/app/Classes/interfaces/keyboard-interactable';
import { KeyboardAndMouseInteractableTool } from 'src/app/Classes/tools/keyboard-and-mouse-interactable-tool';
import { KeyboardInteractableTool } from 'src/app/Classes/tools/keyboard-interactable-tool';
import { KeyboardAndMouseDownableTool } from 'src/app/Classes/tools/keyboard-mouse-downable-tool';
import { MouseDownTool } from 'src/app/Classes/tools/mouse-down-tool';
import { MouseInteractableTool } from 'src/app/Classes/tools/mouse-interactable-tool';
import { WheelInteractableTool } from 'src/app/Classes/tools/wheel-interactable-tool';
import { DrawingHostDirective } from 'src/app/directives/drawing-host/drawing-host.directive';
import { ColorService } from 'src/app/services/color-service/color.service';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { DrawingSavingService } from 'src/app/services/drawing-saving-service/drawing-saving.service';
import { DynamicSvgComponentFactoryService } from 'src/app/services/dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { NewDrawingService } from 'src/app/services/new-drawing-service/new-drawing.service';
import { ClickableTool } from '../../Classes/tools/Clickable-tool';
import { MovableTool } from '../../Classes/tools/Movable-tool';
import { Tool } from '../../Classes/tools/Tool';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss']
})

export class DrawingComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly NB_NONDRAWING_ELEMENT: number = 3;
  readonly cursors: string[] = ['default', 'text'];
  private subscriptions: Subscription[];
  cursorPos: Coord;
  drawingWidth: number;
  drawingHeight: number;
  xmlSVG: string;
  viewBox: string;
  loaderVisibility: string;

  @Input() selectedTool: Tool | undefined;
  @ViewChild(DrawingHostDirective, { static: true }) drawingHost: DrawingHostDirective;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor(
    public colorServ: ColorService,
    private dynamicSvgComponentFactory: DynamicSvgComponentFactoryService,
    private commandInvoker: CommandInvokerService,
    private svgSaveList: DrawingSavingService,
    private newDrawingService: NewDrawingService,
    private cdr: ChangeDetectorRef
  ) {
    this.cursorPos = new Coord();
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.dynamicSvgComponentFactory.viewContainerRef = this.drawingHost.viewContainerRef;
    this.updateViewBox();
    const temp = this.svgSaveList.retrieveSvgInStorage();
    if (temp && temp.preview !== '') {
      this.newDrawingService.loadDrawingInCache(temp);
    }
    this.subscriptions.push(this.newDrawingService.drawingSizeObservable.subscribe(([width, height]) => {
      this.drawingWidth = width;
      this.drawingHeight = height;
      this.updateViewBox();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.subscriptions.push(this.dynamicSvgComponentFactory.changedNotification.pipe(delay(0)).subscribe(() => {
      this.updateXML();
      this.svgSaveList.convertCurrentDrawingForSaving();
    }));
    this.subscriptions.push(this.commandInvoker.didSomething.pipe(delay(0)).subscribe(() => {
      this.updateXML();
      this.svgSaveList.convertCurrentDrawingForSaving();
    }));
    this.subscriptions.push(this.newDrawingService.drawingFinishedLoading.pipe(delay(0)).subscribe(() => {
      this.updateXML();
      this.svgSaveList.convertCurrentDrawingForSaving();
    }));
    this.updateXML();
    this.cdr.detectChanges();
  }

  ngAfterViewChecked(): void {
    this.svgSaveList.convertCurrentDrawingForSaving();
  }

  updateXML(): void {
    this.xmlSVG = new XMLSerializer().serializeToString(this.transformCanvas());
  }

  mouseDown(mouseEvent: MouseEvent): void {
    mouseEvent.preventDefault();
    if (this.selectedTool && this.isMouseDownable()) {
      (this.selectedTool as MouseInteractableTool).mouseDown(mouseEvent);
    }
  }

  mouseUp(): void {
    if (this.selectedTool && this.isMouseInteractable()) {
      (this.selectedTool as MouseInteractableTool).mouseUp(this.cursorPos);
    }
  }

  mouseLeave(): void {
    if (this.selectedTool && this.isMouseInteractable()) {
      (this.selectedTool as MouseInteractableTool).mouseLeave();
    }
  }

  mouseMove(mouseEvent: MouseEvent): void {
    mouseEvent.preventDefault();
    this.cursorPos = CoordExtractor.extractCoords(mouseEvent);
    if (this.selectedTool && this.selectedTool instanceof MovableTool) {
      this.selectedTool.mouseMove(this.cursorPos);
    }
  }

  mouseClick(mouseEvent: MouseEvent): void {
    this.cursorPos = CoordExtractor.extractCoords(mouseEvent);
    if (this.selectedTool && this.hasBeenClickedTimes(mouseEvent, 1)) {
      (this.selectedTool as ClickableTool).mouseClick(this.cursorPos);
    }
    if (this.selectedTool && this.hasBeenClickedTimes(mouseEvent, 2)) {
      (this.selectedTool as ClickableTool).mouseDoubleClick(this.cursorPos);
    }
  }

  onWheel(wheelEvent: WheelEvent): void {
    if (this.selectedTool && this.selectedTool instanceof WheelInteractableTool) {
      (this.selectedTool as WheelInteractableTool).onWheel(wheelEvent);
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: KeyboardEvent): void {
    if ((this.selectedTool && this.isKeyboardInteractable()) || this.isKeyboardAndMouseDownable()) {
      (this.selectedTool as KeyBoardInteractable).keyDown(event, this.cursorPos);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent): void {
    if (this.selectedTool && this.isKeyboardInteractable()) {
      (this.selectedTool as KeyBoardInteractable).keyUp(event, this.cursorPos);
    }
  }

  onContextMenu(e: MouseEvent): void {
    e.preventDefault();
  }

  private transformCanvas(): Node {
    const toSerialize: Node = (this.canvas.nativeElement as Node).cloneNode(true);

    const selectedRectangle = toSerialize.firstChild;
    if (selectedRectangle) {
      toSerialize.removeChild(selectedRectangle);
    }
    for (let i = 0; i < this.NB_NONDRAWING_ELEMENT; i++) {
      const lastChild = toSerialize.lastChild;
      if (lastChild) {
        toSerialize.removeChild(lastChild);
      }
    }
    return toSerialize;
  }

  private hasBeenClickedTimes(mouseEvent: MouseEvent, times: number): boolean {
    return this.selectedTool instanceof ClickableTool && mouseEvent.detail === times;
  }

  private isKeyboardAndMouseDownable(): boolean {
    return this.selectedTool instanceof KeyboardAndMouseDownableTool;
  }

  private isKeyboardInteractable(): boolean {
    return this.selectedTool instanceof KeyboardInteractableTool || this.selectedTool instanceof KeyboardAndMouseInteractableTool;
  }

  private isMouseInteractable(): boolean {
    return this.selectedTool instanceof MouseInteractableTool;
  }

  private isMouseDownable(): boolean {
    return this.isMouseInteractable() || this.selectedTool instanceof MouseDownTool;
  }

  private updateViewBox(): void {
    this.viewBox = '0 0 ' + this.drawingWidth + ' ' + this.drawingHeight;
  }

}
