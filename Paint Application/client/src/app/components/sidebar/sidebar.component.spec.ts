import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupSelector, ToolSelector } from '@app/classes/constant';
import { ViewableSidebarItem } from '@app/classes/viewable-sidebar-item';
import { SidebarItemComponent } from '@app/components/sidebar-item/sidebar-item.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/tools/grid.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { Observable, Subject } from 'rxjs';
import { SidebarComponent } from './sidebar.component';

class ToolControlerStub extends ToolsControllerService {
    items: ViewableSidebarItem[] = [];
    constructor() {
        super(
            {} as DrawingService,
            ({
                getObservableFromShortcut(): Observable<string> {
                    return new Subject<string>().asObservable();
                },
            } as unknown) as KeyHandlerService,
            {} as UndoRedoService,
            {} as GridService,
        );
    }

    setCurrentTool(toolSelector: ToolSelector): void {
        // Should do nothing
    }

    isCurrentToolInGroup(index: number): boolean {
        return false;
    }
}

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let toolControlerStub: ToolControlerStub;
    beforeEach(
        waitForAsync(() => {
            toolControlerStub = new ToolControlerStub();
            TestBed.configureTestingModule({
                imports: [MatMenuModule, MatIconModule, MatTooltipModule],
                declarations: [SidebarComponent, SidebarItemComponent],
                providers: [{ provide: ToolsControllerService, useValue: toolControlerStub }],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should return the GroupShape Enum', () => {
        expect(component.GroupSelector.Shape).toBe(GroupSelector.Shape);
    });
});
