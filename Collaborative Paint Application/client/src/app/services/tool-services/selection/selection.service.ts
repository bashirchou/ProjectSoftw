import { ComponentRef, Injectable } from '@angular/core';
import { Coord } from 'src/app/Classes/coord';
import { CoordExtractor } from 'src/app/Classes/coord-extractor';
import { DrawingElement } from 'src/app/Classes/drawing-element';
import { DynamicElement } from 'src/app/Classes/dynamic-element';
import { MouseButtons } from 'src/app/Classes/enums/mouse-buttons';
import { ToolType } from 'src/app/Classes/enums/tool-type';
import { WheelInteractableTool } from 'src/app/Classes/tools/wheel-interactable-tool';
import { SelectedComponent } from 'src/app/components/drawing/selected/selected.component';
import { SelectionComponent } from 'src/app/components/tools-component/selection/selection.component';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { MoveSelectionService } from './move-selection';
import { RotateSelection } from './rotate-selection';

@Injectable({
  providedIn: 'root'
})
export class SelectionService extends WheelInteractableTool {
  private readonly SVG_NODE_NAME: string = 'svg';
  private selectionRectangleRef: ComponentRef<SelectionComponent>;
  private selectionRectangle: SelectionComponent;

  selectedRect: SelectedComponent;
  selectedElements: ComponentRef<DrawingElement>[];
  mousePositionOnDown: Coord;
  eventTarget: Element;
  moveSelection: MoveSelectionService;
  rotateSelection: RotateSelection;

  private isSelecting: boolean;
  private pressedButton: number;

  constructor(
    private drawingState: DrawingStateService,
    private svgComponentFactory: DynamicSvgComponentFactoryService,
  ) {
    super();
    this.selectedElements = [];
    this.moveSelection = new MoveSelectionService(this.drawingState, this);
    this.rotateSelection = new RotateSelection(this.drawingState, this);
    this.svgComponentFactory.removedNotification.subscribe((removedComponent) => {
      if (removedComponent.instance instanceof DrawingElement) {
        this.removeComponentFromSelection(removedComponent as ComponentRef<DrawingElement>);
      }
    });
  }

  mouseDown(event: MouseEvent): void {
    this.mousePositionOnDown = CoordExtractor.extractCoords(event);
    if (!this.drawingState.isBusy() && !this.moveSelection.isMovingWithKeyboard() && this.validMousePos(this.mousePositionOnDown)) {
      this.pressedButton = event.buttons;
      this.eventTarget = event.target as Element;
      if (!this.moveSelection.isMovingWithMouse()) {
        this.startSelection();
      }
      if (this.pressedButton === MouseButtons.leftClick) {
        this.moveSelection.startMouseMoveSelection();
      }
    }
  }

  mouseMove(mousePos: Coord): void {
    if (this.drawingState.isBusy() && !this.moveSelection.isMovingWithKeyboard() && this.validMousePos(mousePos)) {
      this.moveSelection.mouseMove(mousePos);
      if (!this.moveSelection.isMovingWithMouse()) {
        this.recalculateShape(mousePos);
      }
    }
  }

  mouseUp(mousePos: Coord): void {
    if (!this.moveSelection.isMovingWithKeyboard()) {
      if (this.hasNotMoved(mousePos)) {
        switch (this.pressedButton) {
          case MouseButtons.leftClick:
            this.unselectAll();
            const toSelect: ComponentRef<DynamicElement> | undefined = this.svgComponentFactory.componentRefContainer.find((ref) => {
              return ref.location.nativeElement.firstChild === this.eventTarget;
            });
            if (toSelect && toSelect.instance instanceof DrawingElement) {
              this.addComponentToSelection(toSelect as ComponentRef<DrawingElement>);
            }
            break;
          case MouseButtons.rightClick:
            if (this.eventTarget.nodeName !== this.SVG_NODE_NAME && this.eventTarget.id !== this.selectedRect.SELECTED_RECT_ID) {
              this.invertSelection();
            }
            break;
        }
      }
      this.finishShape();
    }
  }

  mouseLeave(): void {
    this.finishShape();
  }

  keyDown(event: KeyboardEvent, mousePos: Coord): void {
    if (!this.isSelecting) {
      this.moveSelection.keyDown(event);
      this.rotateSelection.keyDown(event);
    }
  }

  keyUp(event: KeyboardEvent, mousePos: Coord): void {
    if (!this.isSelecting) {
      this.moveSelection.keyUp(event);
      this.rotateSelection.keyUp(event);
    }
  }

  onWheel(wheelEvent: WheelEvent): void {
    this.rotateSelection.onWheel(wheelEvent);
  }

  selectAll(): void {
    if (this.drawingState.selectedTool === ToolType.selection) {
      this.svgComponentFactory.componentRefContainer.forEach((component) => {
        if (component.instance instanceof DrawingElement) {
          this.addComponentToSelection(component as ComponentRef<DrawingElement>);
        }
      });
    }
  }

  unselectAll(): void {
    this.selectedElements = [];
    if (this.selectedRect) {
      this.selectedRect.resetSelectedRectangle();
    }
  }

  invertSelection(): void {
    const selectedElements = this.selectedElements;
    this.unselectAll();
    this.svgComponentFactory.componentRefContainer.forEach((component) => {
      if (component.instance instanceof DrawingElement) {
        const componentRef: ComponentRef<DrawingElement> = component as ComponentRef<DrawingElement>;
        if (!selectedElements.includes(componentRef)) {
          this.addComponentToSelection(componentRef);
        }
      }
    });
  }

  getBoundingBox(component: ComponentRef<DrawingElement>): DOMRect {
    const drawing: SVGElement = component.location.nativeElement.ownerSVGElement;
    const bboxOfElement: DOMRect = component.location.nativeElement.getBoundingClientRect();
    const bboxOfDrawing: DOMRect = drawing.getBoundingClientRect() as DOMRect;
    const strokeWidthOfElement: number = +component.instance.getStrokeWidth();
    const halfStrokeWidth = (strokeWidthOfElement / 2);
    bboxOfElement.x -= bboxOfDrawing.x + drawing.clientLeft + halfStrokeWidth;
    bboxOfElement.y -= bboxOfDrawing.y + drawing.clientTop + halfStrokeWidth;
    bboxOfElement.width += strokeWidthOfElement;
    bboxOfElement.height += strokeWidthOfElement;
    return bboxOfElement;
  }

  addComponentToSelection(component: ComponentRef<DrawingElement>): void {
    if (this.selectedElements.length === 0) {
      this.selectedElements.push(component);
      this.updateSelectionOnAdd(component);
    }
  }

  selectionIsEmpty(): boolean {
    return this.selectedElements.length === 0;
  }

  private startSelection(): void {
    this.drawingState.setBusy();
    this.isSelecting = true;
    this.selectionRectangleRef = this.svgComponentFactory.createComponent(SelectionComponent);
    this.selectionRectangle = this.selectionRectangleRef.instance;
    this.selectionRectangle.startingPos = this.mousePositionOnDown;
  }

  private recalculateShape(mousePos: Coord): void {
    const height: number = mousePos.y - this.selectionRectangle.startingPos.y;
    const width: number = mousePos.x - this.selectionRectangle.startingPos.x;
    const absHeight: number = Math.abs(height);
    const absWidth: number = Math.abs(width);
    this.selectionRectangle.anchor.y = this.selectionRectangle.startingPos.y - ((height < 0) ? absHeight : 0);
    this.selectionRectangle.anchor.x = this.selectionRectangle.startingPos.x - ((width < 0) ? absWidth : 0);
    this.selectionRectangle.height = absHeight;
    this.selectionRectangle.width = absWidth;
    this.recalculateSelection();
  }

  private hasNotMoved(mousePos: Coord): boolean {
    return mousePos.x === this.mousePositionOnDown.x && mousePos.y === this.mousePositionOnDown.y;
  }

  private validMousePos(mousePos: Coord): boolean {
    return mousePos.x >= 0 && mousePos.y >= 0;
  }

  private finishShape(): void {
    this.moveSelection.finishTranslation();
    if (this.drawingState.isBusy()) {
      this.drawingState.setAvailable();
      this.isSelecting = false;
      this.svgComponentFactory.deleteComponent(this.selectionRectangleRef);
    }
  }

  private recalculateSelection(): void {
    const elementsInDrawing = this.svgComponentFactory.componentRefContainer;
    elementsInDrawing.forEach((ref) => {
      if (ref.instance instanceof DrawingElement) {
        const componentRef = ref as ComponentRef<DrawingElement>;
        const boundingBox: DOMRect = this.getBoundingBox(componentRef);
        let collidesWithSelection = this.checkBoundingBoxCollision(boundingBox);
        if (this.pressedButton === MouseButtons.rightClick) {
          collidesWithSelection = !collidesWithSelection;
        }
        if (collidesWithSelection) {
          this.addComponentToSelection(componentRef);
        }
        if (!collidesWithSelection) {
          this.removeComponentFromSelection(componentRef);
        }
      }
    });
  }

  private removeComponentFromSelection(component: ComponentRef<DrawingElement>): void {
    const indexToRemove = this.selectedElements.findIndex((componentRef) => componentRef === component);
    // tslint:disable-next-line: no-magic-numbers
    if (indexToRemove !== -1) {
      this.selectedElements.splice(indexToRemove, 1);
      this.updateSelectionOnRemove(component);
    }
  }

  private updateSelectionOnAdd(component: ComponentRef<DrawingElement>): void {
    const bboxOfElement: DOMRect = this.getBoundingBox(component);

    if (this.selectedElements.length === 1) {
      this.selectedRect.anchor = new Coord(bboxOfElement.x, bboxOfElement.y);
      this.selectedRect.width = bboxOfElement.width;
      this.selectedRect.height = bboxOfElement.height;
    }
  }

  private updateSelectionOnRemove(component: ComponentRef<DrawingElement>): void {
    const bboxOfElement: DOMRect = this.getBoundingBox(component);

    if (this.selectedElements.length === 0) {
      this.selectedRect.resetSelectedRectangle();
    } else {
      const firstElement = this.selectedElements[0];
      const firstBbox: DOMRect = this.getBoundingBox(firstElement);
      let newLeft: number = firstBbox.x;
      let newTop: number = firstBbox.y;
      let newRight: number = firstBbox.x + firstBbox.width;
      let newBottom: number = firstBbox.y + firstBbox.height;

      this.selectedElements.forEach((ref) => {
        const bbox: DOMRect = this.getBoundingBox(ref);
        if (bboxOfElement.x === this.selectedRect.anchor.x) {
          newLeft = Math.min(newLeft, bbox.x);
        } else {
          newLeft = this.selectedRect.anchor.x;
        }
        if ((bboxOfElement.y) === this.selectedRect.anchor.y) {
          newTop = Math.min(newTop, bbox.y);
        } else {
          newTop = this.selectedRect.anchor.y;
        }
        if ((bboxOfElement.x + bboxOfElement.width) === this.selectedRect.anchor.x + this.selectedRect.width) {
          newRight = Math.max(newRight, bbox.x + bbox.width);
        } else {
          newRight = this.selectedRect.anchor.x + this.selectedRect.width;
        }
        if ((bboxOfElement.y + bboxOfElement.height) === this.selectedRect.anchor.y + this.selectedRect.height) {
          newBottom = Math.max(newBottom, bbox.y + bbox.height);
        } else {
          newBottom = this.selectedRect.anchor.y + this.selectedRect.height;
        }
      });
      this.selectedRect.anchor.x = newLeft;
      this.selectedRect.width = newRight - newLeft;
      this.selectedRect.anchor.y = newTop;
      this.selectedRect.height = newBottom - newTop;
    }
  }

  // taken from https://developer.mozilla.org/fr/docs/Games/Techniques/2D_collision_detection
  private checkBoundingBoxCollision(bbox: DOMRect): boolean {
    return this.selectionRectangle.anchor.x < bbox.x + bbox.width &&
      this.selectionRectangle.anchor.x + this.selectionRectangle.width > bbox.x &&
      this.selectionRectangle.anchor.y < bbox.y + bbox.height &&
      this.selectionRectangle.height + this.selectionRectangle.anchor.y > bbox.y;
  }
}
