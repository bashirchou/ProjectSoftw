import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { ColorPickerComponent, TableColor } from './color-picker.component';

class DrawingServiceStub {
    canvas: HTMLCanvasElement;
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    primaryColor: string = 'rgba(0,0,0,1)';
    constructor() {
        const canvasHelper = new CanvasTestHelper();
        this.canvas = canvasHelper.canvas;
        this.baseCtx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = canvasHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    }

    changeColor(colorPrimaire: string, colorSecondaire: string): void {
        return;
    }
}

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    const drawingServiceStub: DrawingServiceStub = new DrawingServiceStub();
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                OverlayModule,
                MatDialogModule,
                MatMenuModule,
                MatInputModule,
                BrowserAnimationsModule,
                MatTooltipModule,
                MatIconModule,
                FormsModule,
                ReactiveFormsModule,
                MatDialogModule,
                BrowserAnimationsModule,
                MatDialogModule,
                MatSliderModule,
                MatFormFieldModule,
                MatInputModule,
                MatCheckboxModule,
                FormsModule,
            ],
            declarations: [ColorPickerComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceStub }],
        }).compileComponents();
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Swap primary color and secondary', () => {
        //
        // tslint:disable-next-line: no-string-literal
        const TEMP_RGBA_P: string = component['RGBA_P'];
        // tslint:disable-next-line: no-string-literal
        const TEMP_RGBA_S: string = component['RGBA_S'];
        component.swapColor();
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_P']).toEqual(TEMP_RGBA_S);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_S']).toEqual(TEMP_RGBA_P);
    });

    it('Set the value of alpha', () => {
        const one = 1;
        component.setAlpha(one);
        expect((component.drawingService as DrawingService).baseCtx.globalAlpha).toEqual(one);
        expect((component.drawingService as DrawingService).previewCtx.globalAlpha).toEqual(one);
    });

    it('Converts RBGA to Hex by inputing red,green,blue', () => {
        const red = 0;
        const green = 0;
        const blue = 0;
        const value = '#000000';
        expect(component.rgbToHex(red, green, blue)).toEqual(value);
    });

    it('Converts RBGA to Hex by inserting the RGB value', () => {
        const red = 255;
        const value = 'FF';
        expect(component.convertRBGtoHex(red)).toEqual(value);
    });

    it('Assign the primary color to the left click and the secondary to the right click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
            // tslint:disable-next-line: typedef
            preventDefault() {
                // tslint:disable-next-line: no-empty
            },
            // tslint:disable-next-line: typedef
            stopPropagation() {
                // tslint:disable-next-line: no-empty
            },
        } as MouseEvent;

        const tableColor: TableColor = {
            color: 'rgba(1,1,1,1)',
            hex: '#000000',
        };

        const tableColor2: TableColor = {
            color: 'rgba(0,0,0,0)',
            hex: '#000000',
        };

        spyOn(mouseEventRClick, 'preventDefault');
        spyOn(mouseEventRClick, 'stopPropagation');
        component.changeColorTest(mouseEventLClick, tableColor);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_P']).toEqual(tableColor.color);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_S']).toEqual('rgba(0,0,0,1)');

        component.changeColorTest(mouseEventRClick, tableColor2);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_S']).toEqual(tableColor2.color);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_P']).toEqual(tableColor.color);
        expect(mouseEventRClick.preventDefault).toHaveBeenCalled();
        expect(mouseEventRClick.stopPropagation).toHaveBeenCalled();
    });
    it('Blocks popup', () => {
        const mouseEventClick = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        spyOn(mouseEventClick, 'preventDefault');
        component.blocContext(mouseEventClick);
        expect(mouseEventClick.preventDefault).toHaveBeenCalled();
    });
    it('MouseDown on the pickercolor', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        const mouseEventClick = {
            button: 0,
        } as MouseEvent;
        component.mouseDownPicker(mouseEventClick);
        expect(component.getPickerClicked()).toBeTrue();
    });
    it('Change the input of the colors when clicked', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        component.changeInput();
        expect(component.getPickerClicked()).toBeFalse();
    });

    it('should  get Image data on mouse up picker ', () => {
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['pickerCTX'], 'getImageData').and.callThrough();

        const mouseEventTrueClick = {
            button: 0,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['pickerClicked'] = true;
        component.mouseUpPicker(mouseEventTrueClick);
        expect(spy).toHaveBeenCalled();
    });

    it('should not get Image data on mouse up picker', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        const mouseEventFalseClick = {
            button: 1,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['pickerClicked'] = false;
        component.mouseUpPicker(mouseEventFalseClick);
        const fakeCTX = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        // tslint:disable-next-line: no-string-literal
        component['pickerCTX'] = fakeCTX;
        // tslint:disable-next-line: no-string-literal
        expect(component['pickerCTX'].getImageData).not.toHaveBeenCalled();
    });
    it('should  get Image data on mouse move picker when picker clicked', () => {
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['pickerCTX'], 'getImageData').and.callThrough();

        const mouseEventTrueClick = {
            button: 0,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['pickerClicked'] = true;
        component.primaryClicked = true;
        component.mouseMovePicker(mouseEventTrueClick);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_P']).toEqual('rgba(176,176,176,1)');
        expect(spy).toHaveBeenCalled();
    });
    it('should  get Image data on mouse move picker when picker not clicked', () => {
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['pickerCTX'], 'getImageData').and.callThrough();

        const mouseEventTrueClick = {
            button: 0,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['pickerClicked'] = true;
        component.primaryClicked = false;

        component.mouseMovePicker(mouseEventTrueClick);
        // tslint:disable-next-line: no-string-literal
        expect(component['RGBA_S']).toEqual('rgba(176,176,176,1)');
        expect(spy).toHaveBeenCalled();
    });
    it('should not get Image data on mouse move picker', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        const mouseEventFalseClick = {
            button: 1,
        } as MouseEvent; // monte le 65 et les 2 autre 90//
        // tslint:disable-next-line: no-string-literal
        component['pickerClicked'] = false;
        component.mouseMovePicker(mouseEventFalseClick);
        const fakeCTX = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        // tslint:disable-next-line: no-string-literal
        component['pickerCTX'] = fakeCTX;
        // tslint:disable-next-line: no-string-literal
        expect(component['pickerCTX'].getImageData).not.toHaveBeenCalled();
    });

    it('should  get Image data on  mouse Down Slider', () => {
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['sliderCTX'], 'getImageData').and.callThrough();

        const mouseEventTrueClick = {
            button: 0,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['sliderClicked'] = true;
        component.mouseDownSlider(mouseEventTrueClick);
        expect(spy).toHaveBeenCalled();
    });

    it('should not get Image data on mouse Down slider', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        const mouseEventFalseClick = {
            button: 1,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['sliderClicked'] = false;
        component.mouseDownSlider(mouseEventFalseClick);
        const fakeCTX = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        // tslint:disable-next-line: no-string-literal
        component['pickerCTX'] = fakeCTX;
        // tslint:disable-next-line: no-string-literal
        expect(component['pickerCTX'].getImageData).not.toHaveBeenCalled();
    });
    it('should  check if Sliderclicked is false on mouseUpSlider when clicked', () => {
        const mouseEventTrueClick = {
            button: 0,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['sliderClicked'] = true;
        component.mouseUpSlider(mouseEventTrueClick);
        // tslint:disable-next-line: no-string-literal
        expect(component['sliderClicked']).toBeFalse();
    });
    it('should  check if Sliderclicked is true on mouseUpSlider when notclicked', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        const mouseEventTrueClick = {
            button: 1,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['sliderClicked'] = true;
        component.mouseUpSlider(mouseEventTrueClick);
        // tslint:disable-next-line: no-string-literal
        expect(component['sliderClicked']).toBeTrue();
    });

    it('should  get Image data on mouse Move Slider', () => {
        // tslint:disable-next-line: one-variable-per-declaration
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['sliderCTX'], 'getImageData').and.callThrough();
        const mouseEventTrueClick = {
            button: 0,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['sliderClicked'] = true;
        component.mouseMoveSlider(mouseEventTrueClick);
        expect(spy).toHaveBeenCalled();
    });
    it('should  not move slider when not clicked', () => {
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['sliderCTX'], 'getImageData').and.callThrough();
        const mouseEventTrueClick = {
            button: 0,
            offsetX: 200,
            offsetY: 77,
        } as MouseEvent;
        // tslint:disable-next-line: no-string-literal
        component['sliderClicked'] = false;
        component.mouseMoveSlider(mouseEventTrueClick);
        expect(spy).not.toHaveBeenCalled();
    });
});
// tslint:disable-next-line
export const waitUntil = async (untilTruthy: Function): Promise<boolean> => {
    while (!untilTruthy()) {
        // tslint:disable-next-line
        await interval(25).pipe(take(1)).toPromise();
    }
    return Promise.resolve(true);
};
