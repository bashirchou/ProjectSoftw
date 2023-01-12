import { Injectable } from '@angular/core';
import { Coord } from 'src/app/Classes/coord';
import { RectangleComponent } from 'src/app/components/tools-component/rectangle/rectangle.component';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { DragToolsService } from '../dragTools/drag-tools.service';

@Injectable({
  providedIn: 'root'
})
export class RectangleService extends DragToolsService<RectangleComponent> {

  constructor(
    protected drawingState: DrawingStateService,
    protected svgComponentFactory: DynamicSvgComponentFactoryService,
  ) {
    super(drawingState, svgComponentFactory,RectangleComponent);
  }
  recalculateShape(mousePos: Coord): void {
    const currentRectangle = this.createdCommand.getCreatedComponent();
    const height: number = mousePos.y - currentRectangle.startingPos.y;
    const width: number = mousePos.x - currentRectangle.startingPos.x;
    let absHeight: number = Math.abs(height);
    let absWidth: number = Math.abs(width);

    if (this.shiftIsPressed) {
      if (absHeight < absWidth) {
        absWidth = absHeight;
      } else {
        absHeight = absWidth;
      }
    }
    currentRectangle.anchor.y = currentRectangle.startingPos.y - ((height < 0) ? absHeight : 0);
    currentRectangle.anchor.x = currentRectangle.startingPos.x - ((width < 0) ? absWidth : 0);
    currentRectangle.height = absHeight;
    currentRectangle.width = absWidth;
  }
}
