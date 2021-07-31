import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GroupSelector, ToolSelector } from '@app/classes/constant';
import { Shape } from '@app/classes/shape';
import { Tool } from '@app/classes/tool';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { BucketPaintingService } from '@app/services/tools/bucket-painting.service';
import { GridService } from '@app/services/tools/grid.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { LineService } from '@app/services/tools/line.service';
import { PipetteService } from '@app/services/tools/pipette.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import { SelectionService } from '@app/services/tools/selection.service';
import { StampService } from '@app/services/tools/stamp.service';
import { TexteService } from '@app/services/tools/texte.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { Observable, Subject } from 'rxjs';
import { AttributePaneComponent } from './attribute-pane.component';

class ToolsControllerMock {
    currentTool: Tool = new ShapeStub();
    keyHandlerService: KeyHandlerService = ({
        getObservableFromShortcut(): Observable<string> {
            return new Subject<string>().asObservable();
        },
    } as unknown) as KeyHandlerService;

    getTool(toolSelector: ToolSelector): PipetteService {
        return {} as PipetteService;
    }
}

// tslint:disable: max-classes-per-file
class ShapeStub extends Shape {
    constructor() {
        super({} as DrawingService, ToolSelector.Rectangle, 'i', false, 'name', 'r');
    }
}

class LineStub extends LineService {
    constructor() {
        super({} as DrawingService, {} as UndoRedoService);
    }
}

class PipetteStub extends PipetteService {
    constructor() {
        super({} as DrawingService);
    }
}

class PolygonStub extends PolygonService {
    constructor() {
        super({} as DrawingService, {} as UndoRedoService);
    }
}

class StampStub extends StampService {
    constructor() {
        super({} as DrawingService, {} as UndoRedoService);
    }
}

class AerosolStub extends AerosolService {
    constructor() {
        super({} as DrawingService, {} as UndoRedoService);
    }
}
class TextServiceStub extends TexteService {
    constructor() {
        super({} as DrawingService, {} as KeyHandlerService, {} as UndoRedoService);
    }
}
class BucketStub extends BucketPaintingService {
    constructor() {
        super({} as DrawingService, {} as UndoRedoService);
    }
}

class SelectionServiceStub extends SelectionService {
    constructor() {
        super(
            {} as DrawingService,
            {
                getObservableFromShortcut(shorcut: string): Observable<string> {
                    return new Subject<string>().asObservable();
                },
            } as KeyHandlerService,
            {} as GridService,
            {} as UndoRedoService,
        );
    }
}

class ToolStub extends Tool {
    constructor() {
        super({} as DrawingService, ToolSelector.NoTool);
    }
}
describe('AttributePaneComponent', () => {
    let component: AttributePaneComponent;
    let fixture: ComponentFixture<AttributePaneComponent>;
    const toolControler = new ToolsControllerMock();
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    BrowserAnimationsModule,
                    MatDialogModule,
                    MatSliderModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatCheckboxModule,
                    FormsModule,
                ],
                declarations: [AttributePaneComponent, ColorPickerComponent],
                providers: [{ provide: ToolsControllerService, useValue: toolControler }],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributePaneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('Should return the GroupShape Enum', () => {
        expect(component.GroupSelector.Shape).toBe(GroupSelector.Shape);
    });

    it('Should return min Thickness', () => {
        expect(component.minThickness).toBe(Tool.minThickness);
    });

    it('Should return max Thickness', () => {
        expect(component.maxThickness).toBe(Tool.maxThickness);
    });

    it('Should return min diameter', () => {
        expect(component.minDiameter).toBe(LineService.minDiameter);
    });

    it('Should return max diameter', () => {
        expect(component.maxDiameter).toBe(LineService.maxDiameter);
    });

    it('Should return minEmission', () => {
        expect(component.minEmission).toBe(AerosolService.minEmission);
    });

    it('Should return maxEmission', () => {
        expect(component.maxEmission).toBe(AerosolService.maxEmission);
    });

    it('Should return minJetDiameter', () => {
        expect(component.minJetDiameter).toBe(AerosolService.minJetDiameter);
    });
    it('Should return maxJetDiameter', () => {
        expect(component.maxJetDiameter).toBe(AerosolService.maxJetDiameter);
    });
    it('Should return minGoutteDiameter', () => {
        expect(component.minGoutteDiameter).toBe(AerosolService.minGoutteDiameter);
    });
    it('Should return maxGoutteDiameter', () => {
        expect(component.maxGoutteDiameter).toBe(AerosolService.maxGoutteDiameter);
    });
    it('Should return maxGoutteDiameter', () => {
        expect(component.minColorTolerance).toBe(BucketPaintingService.minColorTolerance);
    });

    it('Should return maxColorTolerance', () => {
        expect(component.maxColorTolerance).toBe(BucketPaintingService.maxColorTolerance);
    });

    it('The getShape() should return a shape', () => {
        toolControler.currentTool = new ShapeStub();
        expect(component.getShape()).toBeInstanceOf(Shape);
    });

    it('The getShape() should Throw a acception if the currentTool is not a shape', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getShape();
        }).toThrowError();
    });

    it('The getLine() should return a Line', () => {
        toolControler.currentTool = new LineStub();
        expect(component.getLine()).toBeInstanceOf(LineService);
    });

    it('The getLine() should Throw a acception if the currentTool is not a Line', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getLine();
        }).toThrowError();
    });
    it('The getEtampe() should return a Stamp', () => {
        toolControler.currentTool = new StampStub();
        expect(component.getStamp()).toBeInstanceOf(StampStub);
    });
    it('The getEtampe() should Throw a acception if the currentTool is not a Etampe', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getStamp();
        }).toThrowError();
    });
    it('The getPolygon() should return a Polygon', () => {
        toolControler.currentTool = new PolygonStub();
        expect(component.getPolygon()).toBeInstanceOf(PolygonStub);
    });
    it('The getPolygon() should Throw a acception if the currentTool is not a Polygon', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getPolygon();
        }).toThrowError();
    });
    it('The getPipette() should return a Pipette', () => {
        toolControler.currentTool = new PipetteStub();
        expect(component.getPipette()).toBeInstanceOf(PipetteStub);
    });

    it('The getPipette() should Throw a acception if the currentTool is not a Pipette', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getPipette();
        }).toThrowError();
    });

    it('The getSelector() should return a SelectionService', () => {
        toolControler.currentTool = new SelectionServiceStub();
        expect(component.getSelector()).toBeInstanceOf(SelectionService);
    });

    it('The getSelector() should Throw a acception if the currentTool is not a SelectionService', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getSelector();
        }).toThrowError();
    });
    it('The getAerosol() should return a Aerosol', () => {
        toolControler.currentTool = new AerosolStub();
        expect(component.getAerosol()).toBeInstanceOf(AerosolStub);
    });

    it('The getAerosol() should Throw a acception if the currentTool is not a Aerosol', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getAerosol();
        }).toThrowError();
    });

    it('The getTextService() should return a TexteService', () => {
        toolControler.currentTool = new TextServiceStub();
        expect(component.getTextService()).toBeInstanceOf(TextServiceStub);
    });

    it('The getTextService() should Throw a acception if the currentTool is not a TexteService', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getTextService();
        }).toThrowError();
    });

    it('The getBucket() should return a Bucket', () => {
        toolControler.currentTool = new BucketStub();
        expect(component.getBucket()).toBeInstanceOf(BucketStub);
    });

    it('The getBucket() should Throw a acception if the currentTool is not a Bucket', () => {
        toolControler.currentTool = new ToolStub();
        expect(() => {
            component.getBucket();
        }).toThrowError();
    });
    it('Should return the number that was sent', () => {
        expect(component.formatLabelNumber(1)).toBe(1);
    });
});
