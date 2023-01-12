import { Injectable } from '@angular/core';
import { Coord } from 'src/app/Classes/coord';
import { EllipseComponent } from 'src/app/components/tools-component/ellipse/ellipse.component';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { DragToolsService } from '../dragTools/drag-tools.service';

@Injectable({
  providedIn: 'root'
})
export class EllipseService extends DragToolsService<EllipseComponent> {

  constructor(
    protected drawingState: DrawingStateService,
    protected svgComponentFactory: DynamicSvgComponentFactoryService,
  ) {
    super(drawingState, svgComponentFactory,EllipseComponent);
  }

  recalculateShape(mousePos: Coord): void {
    const currentEllipse = this.createdCommand.getCreatedComponent();
    const height: number = mousePos.y - currentEllipse.startingPos.y;
    const width: number = mousePos.x - currentEllipse.startingPos.x;
    let absHeight: number = Math.abs(height);
    let absWidth: number = Math.abs(width);

    if (this.shiftIsPressed) {
      if (absHeight < absWidth) {
        absWidth = absHeight;
      } else {
        absHeight = absWidth;
      }
    }
    currentEllipse.center.y = (currentEllipse.startingPos.y + ((height > 0) ? absHeight : -absHeight) / 2);
    currentEllipse.center.x = (currentEllipse.startingPos.x + ((width > 0) ? absWidth : -absWidth) / 2);
    currentEllipse.yRadius = absHeight / 2;
    currentEllipse.xRadius = absWidth / 2;
  }
}
