import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DynamicElement } from 'src/app/Classes/dynamic-element';

@Injectable({
  providedIn: 'root'
})
export class DynamicSvgComponentFactoryService {
  private readonly SVG_NAMESPACE: string = 'http://www.w3.org/2000/svg';
  private readonly SVG_GROUP: string = 'g';

  viewContainerRef: ViewContainerRef;
  componentRefContainer: ComponentRef<DynamicElement>[] = [];

  removedNotification: Observable<ComponentRef<DynamicElement>>;
  private removedComponent: Subject<ComponentRef<DynamicElement>>;
  changedNotification: Observable<void>;
  changedComponent: Subject<void>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
  ) {
    this.removedComponent = new Subject();
    this.removedNotification = this.removedComponent.asObservable();
    this.changedComponent = new Subject();
    this.changedNotification = this.changedComponent.asObservable();
  }

  createComponent<T extends DynamicElement>(componentType: Type<T>): ComponentRef<T> {
    this.checkIfInitialized();
    const componentFactory: ComponentFactory<T> = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const groupParentNode = document.createElementNS(this.SVG_NAMESPACE, this.SVG_GROUP);
    const component = componentFactory.create(this.viewContainerRef.injector, [], groupParentNode);
    this.componentRefContainer.push(component);
    this.viewContainerRef.insert(component.hostView);
    return component;
  }

  addComponent(component: ComponentRef<DynamicElement>): void {
    this.checkIfInitialized();
    this.componentRefContainer.push(component);
    this.viewContainerRef.insert(component.hostView);
    this.notifyChangedComponent();
  }


  removeComponent(component: ComponentRef<DynamicElement>): void {
    this.checkIfInitialized();
    const indexToRemove = this.componentRefContainer.findIndex((componentRef) => componentRef === component);
    // tslint:disable-next-line: no-magic-numbers
    if (indexToRemove !== -1) {
      this.componentRefContainer.splice(indexToRemove, 1);
      this.viewContainerRef.detach(indexToRemove);
      this.removedComponent.next(component);
      this.notifyChangedComponent();
    }
  }

  deleteComponent(component: ComponentRef<DynamicElement>): void {
    this.checkIfInitialized();
    const indexToRemove = this.componentRefContainer.findIndex((componentRef) => componentRef === component);
    // tslint:disable-next-line: no-magic-numbers
    if (indexToRemove !== -1) {
      this.componentRefContainer.splice(indexToRemove, 1);
      this.viewContainerRef.remove(indexToRemove);
    }
  }

  clearViewContainer(): void {
    if (this.viewContainerRef) {
      this.viewContainerRef.clear();
      this.componentRefContainer = [];
    }
  }

  notifyChangedComponent(): void {
    this.changedComponent.next();
  }

  findElementInDrawing(element: Element): ComponentRef<DynamicElement> | undefined {
    return this.componentRefContainer.find((ref) => {
      return ref.location.nativeElement.firstChild === element
        || ref.location.nativeElement.firstChild === element.parentElement;
    });
  }

  private checkIfInitialized(): void {
    if (!this.viewContainerRef) {
      throw new Error('The view container is undefined');
    }
  }

}
