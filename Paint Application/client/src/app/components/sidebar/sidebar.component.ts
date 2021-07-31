import { Component, Injectable } from '@angular/core';
import { GroupSelector } from '@app/classes/constant';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class SidebarComponent {
    toolsControllerService: ToolsControllerService;
    constructor(toolsControllerService: ToolsControllerService) {
        this.toolsControllerService = toolsControllerService;
    }
    get GroupSelector(): typeof GroupSelector {
        return GroupSelector;
    }
}
