import { Injectable } from '@angular/core';
import { PencilComponent } from 'src/app/components/tools-component/pencil/pencil.component';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { PenService } from '../pen/pen.service';

@Injectable({
  providedIn: 'root'
})
export class PencilService extends PenService<PencilComponent> {

  constructor(
    protected drawingState: DrawingStateService,
    protected svgComponentFactory: DynamicSvgComponentFactoryService,
    protected commandInvoker: CommandInvokerService,


  ) {
    super(drawingState, svgComponentFactory, commandInvoker, PencilComponent);
  }
}
