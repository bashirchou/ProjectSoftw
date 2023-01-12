// tslint:disable: no-magic-numbers
import { ComponentRef } from '@angular/core';
import { Coord } from 'src/app/Classes/coord';
import { DummyShapeComponent } from 'src/app/Classes/mock-classes/dummy-shape-component';
import { MockMouseEvent } from 'src/app/Classes/mock-classes/mock-mouse-event';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingStateService } from '../../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { DragToolsService } from './drag-tools.service';

export class DummyDragService extends DragToolsService<DummyShapeComponent> {
  recalculateShape(mousePos: Coord): void {
    // Implementation of abstract method recalculate shape (tested in childrens)
  }
}

describe('DragToolsService', () => {

  let componentFactory: jasmine.SpyObj<DynamicSvgComponentFactoryService>;
  let componentRefMock: jasmine.SpyObj<ComponentRef<DummyShapeComponent>>;
  let drawingState: DrawingStateService;
  let dummyComponent: DummyShapeComponent;
  let service: DummyDragService;
  const shiftLeftPress = new KeyboardEvent('KeyboardEvent', { code: 'ShiftLeft' });

  const mouseDownService = (x: number, y: number) => {
    const mouseDownEvent: MockMouseEvent = new MockMouseEvent('mousedown', { buttons: 1 });
    spyOnProperty(mouseDownEvent, 'offsetX', 'get').and.returnValue(x);
    spyOnProperty(mouseDownEvent, 'offsetY', 'get').and.returnValue(y);
    service.mouseDown(mouseDownEvent);
  };

  beforeEach(() => {
    componentRefMock = jasmine.createSpyObj<ComponentRef<DummyShapeComponent>>(['instance']);
    componentFactory = jasmine.createSpyObj<DynamicSvgComponentFactoryService>(['createComponent', 'notifyChangedComponent']);
    componentFactory.createComponent.and.returnValue(componentRefMock);
    componentFactory.notifyChangedComponent.and.stub();
    dummyComponent = componentRefMock.instance;
    drawingState = new DrawingStateService();
    commandInvoker = new CommandInvokerService();
    service = new DummyDragService(drawingState, componentFactory, commandInvoker, DummyShapeComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#mouseDown should change the starting position and not allow negatives coordinates', () => {
    mouseDownService(5, 5);
    expect(dummyComponent.startingPos).toEqual(new Coord(5, 5));
    service.mouseUp();

    mouseDownService(0, 0);
    mouseDownService(-4, 5);
    expect(dummyComponent.startingPos).toEqual(new Coord(0, 0));
    service.mouseMove(new Coord(-4, -5));
    expect(dummyComponent.startingPos).toEqual(new Coord(0, 0));
    service.keyDown(shiftLeftPress, new Coord(4, -5));
    expect(dummyComponent.startingPos).toEqual(new Coord(0, 0));
    service.keyUp(shiftLeftPress, new Coord(-4, 5));
    expect(dummyComponent.startingPos).toEqual(new Coord(0, 0));
  });

  it('#mouseUp and #mouseLeave should not update drawingState if it is available', () => {
    drawingState.setAvailable();
    spyOn(commandInvoker, 'do');
    spyOn(drawingState, 'setAvailable');
    service.mouseUp();
    service.mouseLeave();
    expect(drawingState.setAvailable).not.toHaveBeenCalled();
    expect(commandInvoker.do).not.toHaveBeenCalled();
  });

  it('#mouseUp and #mouseLeave should update drawingState if it is busy', () => {
    spyOn(commandInvoker, 'do');
    spyOn(drawingState, 'setAvailable');
    drawingState.setBusy();
    service.mouseUp();
    drawingState.setBusy();
    service.mouseLeave();
    expect(drawingState.setAvailable).toHaveBeenCalledTimes(2);
    expect(commandInvoker.do).toHaveBeenCalledTimes(2);
  });
});
