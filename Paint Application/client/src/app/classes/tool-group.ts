import { GroupSelector, ToolSelector } from './constant';
import { Tool } from './tool';
import { ViewableSidebarItem } from './viewable-sidebar-item';

export class ToolGroup implements ViewableSidebarItem {
    name: string;
    icon: string;
    shortcut: string;
    tools: Map<ToolSelector, Tool>;
    bindedKeys: Iterable<ToolSelector> | ArrayLike<ToolSelector>;
    isToolGroup: boolean;
    toolSelector: ToolSelector;
    groupSelector: GroupSelector;

    constructor(name: string, icon: string, public custumIcon: boolean, groupSelector: GroupSelector) {
        this.name = name;
        this.icon = icon;
        this.shortcut = '';
        this.isToolGroup = true;
        this.toolSelector = ToolSelector.Group;
        this.tools = new Map<ToolSelector, Tool>();
        this.groupSelector = groupSelector;
    }

    addTool(tool: Tool): void {
        this.tools.set(tool.toolSelector, tool);
        this.bindedKeys = Array.from(this.tools.keys());
    }

    getTool(tool: ToolSelector): Tool {
        const temp = this.tools.get(tool);
        if (temp == undefined) {
            throw new Error('The tool' + tool + ' does not exist');
        }
        return temp;
    }
}
