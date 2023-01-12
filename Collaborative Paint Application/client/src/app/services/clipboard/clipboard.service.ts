import { ComponentRef, Injectable } from '@angular/core';
import { DrawingElement } from 'src/app/Classes/drawing-element';
import { ColorService } from '../color-service/color.service';
import { CommandInvokerService } from '../command-invoker/command-invoker.service';
import { DeletedCommand } from '../command-invoker/commands/delete-command';
import { DynamicSvgComponentFactoryService } from '../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { SelectionService } from '../tool-services/selection/selection.service';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

;
  private clipboard: ComponentRef<DrawingElement>[];

  constructor(
    private commandInvoker: CommandInvokerService,
    private dynamicFactoryService: DynamicSvgComponentFactoryService,
    private selectionService: SelectionService,
    private colorService: ColorService
  ) {
    this.clipboard = [];
  }



  delete(): void {
    if (!this.selectionService.selectionIsEmpty()) {
      const selectedElems = Object.assign([], this.selectionService.selectedElements);
      selectedElems.forEach((element) => this.dynamicFactoryService.removeComponent(element));
      this.commandInvoker.do(new DeletedCommand(selectedElems, this.dynamicFactoryService));
    }
  }

  apply():void{
    if (!this.selectionService.selectionIsEmpty()) {
      const selectedElems =  this.selectionService.selectedElements;
      selectedElems.forEach((element) => element.instance.changeColor(this.colorService.primaryColor.getRGBAString(), this.colorService.secondaryColor.getRGBAString()));
    }
  }


  clipboardIsEmpty(): boolean {
    return this.clipboard.length === 0;
  }

}
