import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToolSelector } from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { SidebarItemComponent } from './sidebar-item.component';

class ToolStub extends Tool {
    constructor() {
        super({} as DrawingService, ToolSelector.Pensil);
    }
}

// tslint:disable-next-line: max-classes-per-file
class ToolsControllerServiceMock {
    currentToolSelector: ToolSelector;
    getTool(): Tool {
        return new ToolStub();
    }
    setCurrentTool(toolS: ToolSelector): void {
        this.currentToolSelector = toolS;
    }
    isCurrentTool(toolS: ToolSelector): boolean {
        return false;
    }
}

describe('SidebarItemComponent', () => {
    let component: SidebarItemComponent;
    let fixture: ComponentFixture<SidebarItemComponent>;
    const toolsControllerServiceMock = new ToolsControllerServiceMock();
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [MatIconModule, MatTooltipModule],
                declarations: [SidebarItemComponent],
                providers: [{ provide: ToolsControllerService, useValue: toolsControllerServiceMock }],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('When a button is click the current Tool should change in the tool controler', () => {
        component.toolSelector = ToolSelector.Pensil;
        component.onClick();
        expect(toolsControllerServiceMock.currentToolSelector).toBe(component.toolSelector);
    });
});
