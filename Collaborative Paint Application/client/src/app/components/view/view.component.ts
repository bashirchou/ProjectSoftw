import { Component, OnInit } from '@angular/core';
import { ToolType } from 'src/app/Classes/enums/tool-type';
import { Tool } from 'src/app/Classes/tools/Tool';
import { ColorChangerService } from 'src/app/services/tool-services/colorChanger/color-changer.service';
import { EllipseService } from 'src/app/services/tool-services/ellipse/ellipse.service';
import { PencilService } from 'src/app/services/tool-services/pencil/pencil.service';
import { RectangleService } from 'src/app/services/tool-services/rectangle/rectangle.service';
import { SelectionService } from 'src/app/services/tool-services/selection/selection.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})

export class ViewComponent implements OnInit {

  selectedToolType: ToolType;
  type: typeof ToolType;
  selectedTool: Tool | undefined;
  private servicesMap: Map<ToolType, Tool>;

  constructor(
    private pencilService: PencilService,
    private rectangleService: RectangleService,
    private ellipseService: EllipseService,
    private selectionService: SelectionService,
    private colorChangerService: ColorChangerService,

  ) {
    this.servicesMap = new Map<ToolType, Tool>();
    this.type = ToolType;
  }

  ngOnInit(): void {
    this.initServicesMap();
  }

  receiveMessage(selectedToolType: ToolType): void {
    this.selectedToolType = selectedToolType;
    console.log("WHA");
    this.changeToolService();
  }

  private initServicesMap(): void {
    this.servicesMap.set(ToolType.pencil, this.pencilService)
      .set(ToolType.rectangle, this.rectangleService)
      .set(ToolType.ellipse, this.ellipseService)
      .set(ToolType.selection, this.selectionService)
      .set(ToolType.colorchanger, this.colorChangerService)
  }

  private changeToolService(): void {
    this.selectedTool = this.servicesMap.get(this.selectedToolType);
  }
}
