import { EventEmitter, Output, Type } from '@angular/core';
import { AbstractShapeComponent } from 'src/app/Classes/abstract-shape-component';
import { Coord } from 'src/app/Classes/coord';
import { CoordExtractor } from 'src/app/Classes/coord-extractor';
import { MouseButtons } from 'src/app/Classes/enums/mouse-buttons';
import { ToolType } from 'src/app/Classes/enums/tool-type';
import { KeyboardAndMouseInteractableTool } from 'src/app/Classes/tools/keyboard-and-mouse-interactable-tool';
import { CreatedCommand } from '../../command-invoker/commands/created-command';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../../dynamic-svg-component-factory/dynamic-svg-component-factory.service';

export abstract class DragToolsService<T extends AbstractShapeComponent> extends KeyboardAndMouseInteractableTool {

  protected shiftIsPressed: boolean;
  protected createdCommand: CreatedCommand<T>; 
  @Output() messageEvent: EventEmitter<ToolType>;

  constructor(
    protected drawingState: DrawingStateService,
    protected svgComponentFactory: DynamicSvgComponentFactoryService,
    protected type: Type<T>,
  ) {
    super();
    this.shiftIsPressed = false;
  }

  mouseDown(event: MouseEvent): void {
    const mousePos = CoordExtractor.extractCoords(event);
    if (!this.drawingState.isBusy() && this.validMousePos(mousePos) && event.buttons === MouseButtons.leftClick) {
      this.drawingState.setBusy();
      const createdShape = this.svgComponentFactory.createComponent(this.type);
      this.createdCommand = new CreatedCommand<T>(createdShape, this.svgComponentFactory);
      this.createdCommand.getCreatedComponent().startingPos = mousePos;
    }
  }

  mouseMove(mousePos: Coord): void {
    if (this.drawingState.isBusy() && this.validMousePos(mousePos)) {
      this.recalculateShape(mousePos);
    }
  }

  mouseUp(): void {
    this.finishShape();
  }

  mouseLeave(): void {
    this.finishShape();
  }

  keyDown(event: KeyboardEvent, mousePos: Coord): void {
    if (this.drawingState.isBusy() && this.validKey(event) && this.validMousePos(mousePos)) {
      this.shiftIsPressed = true;
      this.recalculateShape(mousePos);
    }
  }

  keyUp(event: KeyboardEvent, mousePos: Coord): void {
    this.shiftIsPressed = false;
    if (this.drawingState.isBusy() && this.validMousePos(mousePos)) {
      this.recalculateShape(mousePos);
    }
  }

  private validMousePos(mousePos: Coord): boolean {
    return mousePos.x >= 0 && mousePos.y >= 0;
  }

  private validKey(event: KeyboardEvent): boolean {
    return event.code === 'ShiftLeft' || event.code === 'ShiftRight';
  }

  private finishShape(): void {
    if (this.drawingState.isBusy()) {
      this.drawingState.setAvailable();
      this.svgComponentFactory.notifyChangedComponent();
    }
  }

  abstract recalculateShape(mousePos: Coord): void;
}
