import { TestBed } from '@angular/core/testing';
import { DEFAULT_TOOL, ToolSelector } from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from './pencil.service';
import { RectangleService } from './rectangle.service';
import { ToolsControllerService } from './tools-controller.service';

class ToolMock extends Tool {
    constructor() {
        super({} as DrawingService, ToolSelector.NoTool);
        this.name = 'MOCK_TOOL';
    }
}
describe('ToolsControllerService', () => {
    let service: ToolsControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToolsControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('The add method should add in the items the new Tools', () => {
        service.addItem(new ToolMock());
        expect(service.items[service.items.length - 1].name).toBe('MOCK_TOOL');
    });
    it('The current tool should be the one changed to', () => {
        service.setCurrentTool(ToolSelector.Pensil);
        const isPensil = service.currentTool instanceof PencilService;
        expect(isPensil).toBe(true);
    });

    it('The current toolSelector should be the one changed to when in a Group', () => {
        service.setCurrentTool(ToolSelector.Pensil);
        expect(service.currentToolSelector).toBe(ToolSelector.Pensil);
    });

    it('The current toolSelector should be the one changed to when not in a Group', () => {
        service.setCurrentTool(ToolSelector.Line);
        expect(service.currentToolSelector).toBe(ToolSelector.Line);
    });

    it('The getGroup method should return a exeption if the index is invalid', () => {
        let errorAsBeenTrow = false;
        const invalidGroup = -1;
        try {
            service.getGroup(invalidGroup);
        } catch (error) {
            errorAsBeenTrow = true;
        }
        expect(errorAsBeenTrow).toBe(true);
        errorAsBeenTrow = false;
        try {
            service.getGroup(service.items.length);
        } catch (error) {
            errorAsBeenTrow = true;
        }
        expect(errorAsBeenTrow).toBe(true);
    });

    it('The getGroup method should return a exeption if the item chosen is not a Group', () => {
        const indexLineTool = 2;
        let errorAsBeenTrow = false;
        try {
            service.getGroup(indexLineTool);
        } catch (error) {
            errorAsBeenTrow = true;
        }
        expect(errorAsBeenTrow).toBe(true);
    });

    it('The default tool should be the right one', () => {
        expect(service.currentToolSelector).toBe(DEFAULT_TOOL);
    });

    it('The isCurrentTool should return true if the tool selected is sent', () => {
        expect(service.isCurrentTool(DEFAULT_TOOL)).toBe(true);
    });

    it('The isCurrentTool should return false if the tool not selected is sent', () => {
        service.currentToolSelector = ToolSelector.Pensil;
        expect(service.isCurrentTool(ToolSelector.NoTool)).toBe(false);
    });

    it('The Rectangle Tool should be in the Shape Group', () => {
        service.currentToolSelector = ToolSelector.Rectangle;
        expect(service.isCurrentToolInGroup(1)).toBe(true);
    });
    it('The pensil Tool should not be in the Shape Group', () => {
        service.currentToolSelector = ToolSelector.Pensil;
        expect(service.isCurrentToolInGroup(1)).toBe(false);
    });
    it('The current tool should not be in a tool', () => {
        const indexLineService = 2;
        expect(service.isCurrentToolInGroup(indexLineService)).toBe(false);
    });
    it('The method should return false on a incorrect index', () => {
        const invalidGroup = -1;
        expect(service.isCurrentToolInGroup(invalidGroup)).toBe(false);
        expect(service.isCurrentToolInGroup(service.items.length)).toBe(false);
    });
    it('The method should return the Right Tool', () => {
        const rectangle = service.getTool(ToolSelector.Rectangle);
        const isRectangleTool = rectangle instanceof RectangleService;
        expect(isRectangleTool).toBe(true);
    });
    it('The method should return a error if the tool do not exist', () => {
        let errorTrown = false;
        const invalidTool = -1;
        try {
            service.getTool(invalidTool);
        } catch (error) {
            errorTrown = true;
        }
        expect(errorTrown).toBe(true);
    });
});
