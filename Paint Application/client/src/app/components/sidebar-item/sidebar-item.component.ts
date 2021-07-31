import { Component, Injectable, Input } from '@angular/core';
import { ToolSelector } from '@app/classes/constant';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
@Component({
    selector: 'app-sidebar-item',
    templateUrl: './sidebar-item.component.html',
    styleUrls: ['./sidebar-item.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class SidebarItemComponent {
    @Input() toolSelector: ToolSelector;
    toolsControllerService: ToolsControllerService;
    constructor(toolsControllerService: ToolsControllerService) {
        this.toolsControllerService = toolsControllerService;
    }
    onClick(): void {
        this.toolsControllerService.setCurrentTool(this.toolSelector);
    }
}
