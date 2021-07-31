import { GroupSelector, ToolSelector } from './constant';

export interface ViewableSidebarItem {
    icon: string;
    name: string;
    shortcut: string;
    toolSelector: ToolSelector;
    groupSelector: GroupSelector;
    custumIcon: boolean;
}
