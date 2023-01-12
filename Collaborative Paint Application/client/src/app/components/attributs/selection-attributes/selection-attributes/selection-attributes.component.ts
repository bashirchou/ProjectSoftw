import { Component } from '@angular/core';
import { ClipboardService } from 'src/app/services/clipboard/clipboard.service';
import { DynamicSvgComponentFactoryService } from 'src/app/services/dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { SelectionService } from 'src/app/services/tool-services/selection/selection.service';

@Component({
  selector: 'app-selection-attributes',
  templateUrl: './selection-attributes.component.html',
  styleUrls: ['./selection-attributes.component.scss']
})
export class SelectionAttributesComponent {

  test: boolean;
  constructor(
    private dynamicComponentFactory: DynamicSvgComponentFactoryService,
    private selectionService: SelectionService,
    private clipboard: ClipboardService,
  ) {
    this.test = true;
   }


  delete(): void {
    this.clipboard.delete();
  }
  apply():void{
    this.clipboard.apply(); 
  }

  
  clipboardIsEmpty(): boolean {
    return this.clipboard.clipboardIsEmpty();
  }

  selectionIsEmpty(): boolean {
    return this.selectionService.selectionIsEmpty();
  }

  drawingIsEmpty(): boolean {
    return this.dynamicComponentFactory.componentRefContainer.length === 0;
  }
}
