import { DrawingService } from '@app/services/drawing/drawing.service';
import { GroupSelector, ToolSelector } from './constant';
import { Vec2 } from './vec2';
import { ViewableSidebarItem } from './viewable-sidebar-item';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool implements ViewableSidebarItem {
    static minThickness: number = 1;
    static maxThickness: number = 100;
    groupSelector: GroupSelector = GroupSelector.NotAGroup;
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    mouseCanvas: boolean = true;
    mouseUp: boolean = true;
    disableDraw: boolean = true;
    protected primaryColor: string = '';
    protected secondaryColor: string = '';

    icon: string;
    name: string;
    shortcut: string;

    toolSelector: ToolSelector;
    // tslint:disable-next-line: variable-name
    private _thickness: number = 1;
    custumIcon: boolean = false;
    constructor(
        protected drawingService: DrawingService,
        toolSelector: ToolSelector,
        icon?: string,
        custumIcon?: boolean,
        name?: string,
        shortcut?: string,
    ) {
        this.toolSelector = toolSelector;
        if (icon != undefined) {
            this.icon = icon;
        }
        if (name != undefined) {
            this.name = name;
        }
        if (shortcut != undefined) {
            this.shortcut = shortcut;
        }
        if (custumIcon != undefined) {
            this.custumIcon = custumIcon;
        }
    }

    get thickness(): number {
        return this._thickness;
    }

    set thickness(newThickness: number) {
        if (newThickness >= Tool.minThickness && newThickness <= Tool.maxThickness) {
            this._thickness = newThickness;
        }
    }

    onDoubleClick(event: MouseEvent): void {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseLeave(event: MouseEvent): void {}

    onMouseEnter(event: MouseEvent): void {
        this.disableDraw = false;
    }

    onMouseOut(event: MouseEvent): void {}

    onMouseOver(event: MouseEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onWindowScroll(event: WheelEvent, path: Vec2): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
}
