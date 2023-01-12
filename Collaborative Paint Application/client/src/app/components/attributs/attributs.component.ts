import { Component, Input } from '@angular/core';
import { ToolType } from 'src/app/Classes/enums/tool-type';

@Component({
  selector: 'app-attributs',
  templateUrl: './attributs.component.html',
  styleUrls: ['./attributs.component.scss']
})
export class AttributsComponent {

  @Input() selectedToolType: ToolType;

  toolType: typeof ToolType;

  constructor() {
    this.toolType = ToolType;
  }
}
