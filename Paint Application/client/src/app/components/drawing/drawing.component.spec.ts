import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
// import { Router } from '@angular/router';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, MIN_CANVAS_HEIGHT, MIN_CANVAS_WIDTH, ToolSelector } from '@app/classes/constant';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { DrawingComponent } from './drawing.component';

class ToolStub extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService, ToolSelector.NoTool);
    }
}
// On en a besoin pour les tests, cela ne vaut pas la peine de créer un fichier classe pour un Stub
// tslint:disable:max-classes-per-file
class StubToolControler {
    currentTool: Tool;
    constructor(currentTool: Tool) {
        this.currentTool = currentTool;
    }
    setCurrentTool(toolSelector: ToolSelector): void {
        // N'a pas besoin de faire quelquechose, juste pour permettre de compiler
    }
    isCurrentTool(): boolean {
        return true;
    }
}
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    // tslint:disable-next-line: prefer-const
    let drawingStub: DrawingService;
    let toolsControllerStub: StubToolControler;
    beforeEach(
        waitForAsync(() => {
            toolStub = new ToolStub(drawingStub);
            toolsControllerStub = new StubToolControler(toolStub);
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }])],
                declarations: [DrawingComponent],
                providers: [
                    { provide: PencilService, useValue: toolStub },
                    { provide: ToolsControllerService, useValue: toolsControllerStub },
                ],
            }).compileComponents();
        }),
    );
    beforeEach(async () => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // tslint:disable-next-line: no-magic-numbers
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a default WIDTH and HEIGHT', () => {
        // tslint:disable-next-line: no-magic-numbers
        const height = (component.height = 600);
        // tslint:disable-next-line: no-magic-numbers
        const width = (component.width = 1000);
        expect(height).toEqual(DEFAULT_HEIGHT);
        expect(width).toEqual(DEFAULT_WIDTH);
    });

    it('The working zone should take all the available space', () => {
        expect(component.previewHeight).toEqual(window.innerHeight);
        // tslint:disable-next-line: no-magic-numbers
        const width = (window.innerWidth * 4) / 5;
        const delta = 0.1;
        expect(component.previewWidth).toBeLessThanOrEqual(width + delta);
        expect(component.previewWidth).toBeGreaterThanOrEqual(width - delta);
    });

    it('The canvas should be initialise after creating a this component', () => {
        expect(component.baseCanvas).toBeDefined();
        // tslint:disable-next-line: no-string-literal
        expect(component['previewCtx']).toBeDefined();
        expect(component.previewCanvas).toBeDefined();
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsControllerStub.currentTool, 'onDoubleClick').and.callThrough();
        component.onDoubleClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' should call isMouseOnCornerRezise when the mouse is near the edge borders', () => {
        const mouseEvent = { offsetX: component.drawingService.width, offsetY: component.drawingService.height } as MouseEvent;
        const eventNotGood = { offsetX: component.drawingService.width / 2, offsetY: component.drawingService.height / 2 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        expect(component['isMouseOnCornerResize'](mouseEvent)).toBeTrue();
        // tslint:disable-next-line: no-string-literal
        expect(component['isMouseOnCornerResize'](eventNotGood)).toBeFalse();
    });
    it('The method isMouseOnButtonResize should return true if the mouse is on the button control point', () => {
        // tslint:disable-next-line: no-string-literal
        const event = { offsetX: component['drawingService'].width / 2, offsetY: component['drawingService'].height + 1 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        const eventNotGood = { offsetX: 0, offsetY: component['drawingService'].height } as MouseEvent;

        // tslint:disable-next-line: no-string-literal
        expect(component['isMouseOnButtonResize'](event)).toBeTrue();
        // tslint:disable-next-line: no-string-literal
        expect(component['isMouseOnButtonResize'](eventNotGood)).toBeFalse();
    });
    it('The method isMouseOnRightResize should return true if the mouse is on the button control point', () => {
        // tslint:disable-next-line: no-string-literal
        const event = { offsetX: component['drawingService'].width, offsetY: component['drawingService'].height / 2 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        const eventNotGood = { offsetX: 0, offsetY: component['drawingService'].height } as MouseEvent;

        // tslint:disable-next-line: no-string-literal
        expect(component['isMouseOnRightResize'](event)).toBeTrue();
        // tslint:disable-next-line: no-string-literal
        expect(component['isMouseOnRightResize'](eventNotGood)).toBeFalse();
    });
    it(' should push the right coordinate when the canvas is resizing by the right', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.cornerResize = false;
        component.rightResize = true;
        component.buttonResize = false;

        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        const mouseEventSpy = spyOn(component['previewRectangle'].pathData, 'push').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalledWith({ x: 0, y: component.drawingService.height } as Vec2);
    });

    it(' should update de mouseOnCanvas when the mouse move', () => {
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].mouseOnWorkingZone = true;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component.onMouseMove(event);
        // tslint:disable-next-line: no-string-literal
        expect(component['drawingService'].mouseOnCanvas).toBeTrue();
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].mouseOnWorkingZone = false;
        component.onMouseMove(event);
        // tslint:disable-next-line: no-string-literal
        expect(component['drawingService'].mouseOnCanvas).toBeFalse();

        // tslint:disable-next-line: no-string-literal
        component['drawingService'].mouseOnWorkingZone = true;
        component.onMouseMove({ offsetX: -1, offsetY: -1 } as MouseEvent);
        // tslint:disable-next-line: no-string-literal
        expect(component['drawingService'].mouseOnCanvas).toBeFalse();
    });
    it(' should push the right coordinate when the canvas is resizing by the buttom', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.cornerResize = false;
        component.rightResize = false;
        component.buttonResize = true;

        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        const mouseEventSpy = spyOn(component['previewRectangle'].pathData, 'push').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalledWith({ x: component.drawingService.width, y: 0 } as Vec2);
    });

    it(' should push the right coordinate when the canvas is resizing by the corner', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.cornerResize = true;

        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        const mouseEventSpy = spyOn(component['previewRectangle'].pathData, 'push').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalledWith({ x: 0, y: 0 } as Vec2);
    });

    it(' should change the cornerResize to true if the mouse is on the corner control point', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = false;

        const event = { offsetX: component.drawingService.width, offsetY: component.drawingService.height } as MouseEvent;
        component.onMouseMove(event);
        expect(component.cornerResize).toBeTrue();
    });

    it(' should change the buttonResize to true if the mouse is on the buttom control point', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = false;

        const event = { offsetX: component.drawingService.width / 2, offsetY: component.drawingService.height } as MouseEvent;
        component.onMouseMove(event);
        expect(component.buttonResize).toBeTrue();
    });

    it(' should change the rightResize to true if the mouse is on the right control point', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = false;

        const event = { offsetX: component.drawingService.width, offsetY: component.drawingService.height / 2 } as MouseEvent;
        component.onMouseMove(event);
        expect(component.rightResize).toBeTrue();
    });

    it(' should change cornerResize to false and buttonResize to false if the mouse is not on any control point', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = false;

        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const onMouseMoveSpy = spyOn(toolsControllerStub.currentTool, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(component.cornerResize).toBeFalse();
        expect(component.buttonResize).toBeFalse();
        expect(component.rightResize).toBeFalse();
        expect(onMouseMoveSpy).toHaveBeenCalled();
    });

    it('Should put resizing at true if the mousee is on a control point ', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = false;
        component.cornerResize = true;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        component.onMouseDown(event);
        // tslint:disable-next-line: no-string-literal
        expect(component['resizing']).toBeTrue();
    });

    it('Should put resizing at false if the mouse is on a control point ', () => {
        // tslint:disable-next-line: no-string-literal
        component['cornerResize'] = false;
        component.rightResize = false;
        component.buttonResize = false;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const onMouseMoveSpy = spyOn(toolsControllerStub.currentTool, 'onMouseDown').and.callThrough();

        component.onMouseDown(event);
        // tslint:disable-next-line: no-string-literal
        expect(component['resizing']).toBeFalse();

        expect(onMouseMoveSpy).toHaveBeenCalled();
    });

    it('Should call mouseUp if the canvas is not resizing', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = false;

        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const onMouseMoveSpy = spyOn(toolsControllerStub.currentTool, 'onMouseUp').and.callThrough();

        component.onMouseUp(event);
        // tslint:disable-next-line: no-string-literal

        expect(onMouseMoveSpy).toHaveBeenCalled();
    });

    it('Disable rezising after a canvas resize', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;

        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        // tslint:disable-next-line: prettier
        component.onMouseUp(event);
        // tslint:disable-next-line: no-string-literal

        // tslint:disable-next-line: no-string-literal
        expect(component['resizing']).toBeFalse();
        expect(component.cornerResize).toBeFalse();
        expect(component.buttonResize).toBeFalse();
        expect(component.rightResize).toBeFalse();
    });

    it('Should call the resizing function with the right parameter if the canvas is resizing', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.cornerResize = true;
        component.buttonResize = false;
        component.rightResize = false;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const onMouseMoveSpy = spyOn(component.drawingService, 'resize').and.callThrough();
        component.onMouseUp(event);
        expect(onMouseMoveSpy).toHaveBeenCalledWith(0, 0);
    });

    it('Should call the resizing function with the right parameter if the canvas is resizing corner', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.cornerResize = false;
        component.buttonResize = false;
        component.rightResize = true;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const onMouseMoveSpy = spyOn(component.drawingService, 'resize').and.callThrough();
        component.onMouseUp(event);
        expect(onMouseMoveSpy).toHaveBeenCalledWith(0, component.drawingService.height);
    });

    it('Should call the resizing function with the right parameter if the canvas is resizing buttom', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.cornerResize = false;
        component.buttonResize = true;
        component.rightResize = false;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const onMouseMoveSpy = spyOn(component.drawingService, 'resize').and.callThrough();
        component.onMouseUp(event);
        expect(onMouseMoveSpy).toHaveBeenCalledWith(component.drawingService.width, 0);
    });

    it('previewHeight should be equal to canvs height + the min visible working zone and previewWidth should be equal to canvas width + the min visible working zone', () => {
        // tslint:disable-next-line: no-string-literal
        component['resizing'] = true;
        component.drawingService.canvas.width = MIN_CANVAS_WIDTH;
        component.previewWidth = MIN_CANVAS_WIDTH - 1;
        component.drawingService.canvas.height = MIN_CANVAS_HEIGHT;
        component.previewHeight = MIN_CANVAS_HEIGHT - 1;
        const event = { offsetX: 0, offsetY: 0 } as MouseEvent;
        component.onMouseUp(event);
        // tslint:disable-next-line: no-string-literal
        expect(component.previewWidth).toEqual(component['resizePreviewCtx'].canvas.width + component.minVisibleWorkingZone);
        // tslint:disable-next-line: no-string-literal
        expect(component.previewHeight).toEqual(component['resizePreviewCtx'].canvas.height + component.minVisibleWorkingZone);
    });
    it(" should call the tool's onMouseLeave when receiving a onMouseLeave event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsControllerStub.currentTool, 'onMouseLeave').and.callThrough();
        component.onMouseLeave(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's onMouseOver when receiving a onMouseOver event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsControllerStub.currentTool, 'onMouseOver').and.callThrough();
        component.onMouseOver(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's onMouseOut when receiving a onMouseOut event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsControllerStub.currentTool, 'onMouseOut').and.callThrough();
        component.onMouseOut(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's onKeyDown when receiving a onKeyDown event", () => {
        const event = {} as KeyboardEvent;
        const mouseEventSpy = spyOn(toolsControllerStub.currentTool, 'onKeyDown').and.callThrough();
        component.onKeyDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's onKeyDown when receiving a onKeyDown event", () => {
        const event = {} as KeyboardEvent;
        const mouseEventSpy = spyOn(toolsControllerStub.currentTool, 'onKeyUp').and.callThrough();
        component.onKeyUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' get width should return width', () => {
        // tslint:disable-next-line: no-string-literal
        expect(component.width).toBe(component['canvasSize'].x);
    });

    it(' get height should return height', () => {
        // tslint:disable-next-line: no-string-literal
        expect(component.height).toBe(component['canvasSize'].y);
    });

    it(' Set height should set height', () => {
        component.height = 1;
        // tslint:disable-next-line: no-string-literal
        expect(component['canvasSize'].y).toBe(1);
    });

    it(' Set width should set width', () => {
        component.width = 2;
        // tslint:disable-next-line: no-string-literal
        expect(component['canvasSize'].x).toBe(2);
    });

    it(' get ToolSelector should return the ToolSelector', () => {
        expect(component.ToolSelector).toBe(ToolSelector);
    });

    it('Should disable context menu if in canvas', () => {
        // tslint:disable-next-line: no-empty
        const mouseEvent = { preventDefault(): void {}, offsetX: 0, offsetY: 0 } as MouseEvent;
        const mouseEventSpy = spyOn(mouseEvent, 'preventDefault').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].mouseOnCanvas = true;
        component.onRightClick(mouseEvent);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it('Should not disable context menu if in canvas', () => {
        // tslint:disable-next-line: no-empty
        const mouseEvent = { preventDefault(): void {}, offsetX: 0, offsetY: 0 } as MouseEvent;
        const mouseEventSpy = spyOn(mouseEvent, 'preventDefault').and.callThrough();
        // tslint:disable-next-line: no-string-literal
        component['drawingService'].mouseOnCanvas = false;
        component.onRightClick(mouseEvent);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });
    // tslint:disable-next-line: max-file-line-count
});
