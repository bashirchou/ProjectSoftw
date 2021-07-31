import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MouseButton } from '@app/classes/constant';
import { DrawingService } from '@app/services/drawing/drawing.service';
export interface TableColor {
    color: string;
    hex: string;
}
@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements AfterViewInit {
    @ViewChild('slider', { static: false })
    private slider: ElementRef<HTMLCanvasElement>;

    @ViewChild('picker', { static: false })
    private picker: ElementRef<HTMLCanvasElement>;

    private sliderClicked: boolean = false;
    private pickerClicked: boolean = false;
    private sliderCTX: CanvasRenderingContext2D;
    private pickerCTX: CanvasRenderingContext2D;

    RBGA: string = 'rgba(0,0,0,1)';
    private RGBA_P: string = 'rgba(255,0,0,1)';
    private RGBA_S: string = 'rgba(0,0,0,1)';
    red: number = 0;
    green: number = 0;
    blue: number = 0;
    alpha: number = 1;

    primaryClicked: boolean = true;

    couleurPrincipale: TableColor = { color: '', hex: '' };
    couleurSecondaire: TableColor = { color: '', hex: '' };

    tabColor: TableColor[];
    private numberOfSaveColor: number = 10;
    private alphaConvertion: number = 100;
    private base: number = 10;
    getPickerClicked(): boolean {
        return this.pickerClicked;
    }

    constructor(public dialog: MatDialog, public drawingService: DrawingService) {
        this.tabColor = new Array(this.numberOfSaveColor);
        this.tabColor.fill({ color: 'ox0000', hex: '' });
        const colors = this.drawingService.primaryColor.replace('rgba(', '').replace(')', '').split(',');
        this.red = parseInt(colors[0], this.base);
        this.green = parseInt(colors[1], this.base);
        this.blue = parseInt(colors[2], this.base);
        // tslint:disable-next-line: no-magic-numbers
        this.alpha = parseInt(colors[3], this.base) * this.alphaConvertion;
    }

    // https://malcoded.com/posts/angular-color-picker/
    ngAfterViewInit(): void {
        // draw slider
        this.sliderCTX = this.slider.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.sliderCTX.beginPath();
        const gradient = this.sliderCTX.createLinearGradient(0, 0, 0, this.sliderCTX.canvas.height);
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        // tslint:disable-next-line: no-magic-numbers
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

        this.sliderCTX.beginPath();
        this.sliderCTX.rect(0, 0, this.sliderCTX.canvas.width, this.sliderCTX.canvas.height);
        this.sliderCTX.fillStyle = gradient;
        this.sliderCTX.fill();
        this.sliderCTX.closePath();
        this.drawPicker('rgba(255,255,255,1)');
    }

    drawPicker(color: string): void {
        // drawpicker
        this.pickerCTX = this.picker.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.pickerCTX.beginPath();
        this.pickerCTX.fillStyle = color;
        this.pickerCTX.fillRect(0, 0, this.pickerCTX.canvas.width, this.pickerCTX.canvas.height);

        const whiteGrad = this.pickerCTX.createLinearGradient(0, 0, this.pickerCTX.canvas.width, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');

        this.pickerCTX.fillStyle = whiteGrad;
        this.pickerCTX.fillRect(0, 0, this.pickerCTX.canvas.width, this.pickerCTX.canvas.height);

        const blackGrad = this.pickerCTX.createLinearGradient(0, 0, 0, this.pickerCTX.canvas.height);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');

        this.pickerCTX.fillStyle = blackGrad;
        this.pickerCTX.fillRect(0, 0, this.pickerCTX.canvas.width, this.pickerCTX.canvas.height);
        this.pickerCTX.closePath();
    }

    mouseMoveSlider(event: MouseEvent): void {
        if (this.sliderClicked) {
            const imageData = this.sliderCTX.getImageData(event.offsetX, event.offsetY, 1, 1).data;
            this.drawPicker('rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)');
        }
    }
    mouseUpSlider(event: MouseEvent): void {
        if (event.button === 0) {
            this.sliderClicked = false;
        }
    }

    mouseDownSlider(event: MouseEvent): void {
        if (event.button === 0) {
            this.sliderClicked = true;
            const imageData = this.sliderCTX.getImageData(event.offsetX, event.offsetY, 1, 1).data;
            this.drawPicker('rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)');
        }
    }

    mouseMovePicker(event: MouseEvent): void {
        if (this.pickerClicked) {
            const imageData = this.pickerCTX.getImageData(event.offsetX, event.offsetY, 1, 1).data;
            this.RBGA = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
            this.primaryClicked ? (this.RGBA_P = this.RBGA) : (this.RGBA_S = this.RBGA);
        }
    }

    mouseUpPicker(event: MouseEvent): void {
        if (event.button === 0 && this.pickerClicked) {
            this.pickerClicked = false;
            const imageData = this.pickerCTX.getImageData(event.offsetX, event.offsetY, 1, 1).data;
            this.RBGA = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
            this.primaryClicked ? (this.RGBA_P = this.RBGA) : (this.RGBA_S = this.RBGA);
            this.red = imageData[0];
            this.green = imageData[1];
            this.blue = imageData[2];
            const hexString = this.rgbToHex(this.red, this.green, this.blue);
            this.tabColor.push({ color: this.RBGA, hex: hexString });
            this.tabColor.shift();

            this.drawingService.changeColor(this.RGBA_P, this.RGBA_S);
        }
    }

    changeInput(): void {
        this.primaryClicked
            ? (this.RGBA_P = 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + this.alpha / this.alphaConvertion + ')')
            : (this.RGBA_S = 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + this.alpha / this.alphaConvertion + ')');
        this.tabColor.push({
            color: 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + this.alpha / this.alphaConvertion + ')',
            hex: this.rgbToHex(this.red, this.green, this.blue),
        });
        this.tabColor.shift();
        this.drawingService.changeColor(this.RGBA_P, this.RGBA_S);
    }

    mouseDownPicker(event: MouseEvent): void {
        if (event.button === 0) {
            this.pickerClicked = true;
        }
    }

    blocContext(event: MouseEvent): void {
        event.preventDefault();
    }
    changeColorTest(event: MouseEvent, table: TableColor): void {
        if (MouseButton.Left === event.button) {
            this.couleurPrincipale = table;
            this.RGBA_P = table.color;
        }

        if (MouseButton.Right === event.button) {
            event.preventDefault();
            event.stopPropagation();
            this.couleurSecondaire = table;
            this.RGBA_S = table.color;
        }

        this.drawingService.changeColor(this.RGBA_P, this.RGBA_S);
    }

    convertRBGtoHex(rbg: number): string {
        let hex = Number(rbg).toString(16).toUpperCase();
        if (hex.length < 2) {
            hex = '0' + hex;
        }

        return hex;
    }

    rgbToHex(r: number, g: number, b: number): string {
        return '#' + this.convertRBGtoHex(r) + this.convertRBGtoHex(g) + this.convertRBGtoHex(b);
    }

    setAlpha(alpha: number): void {
        this.drawingService.baseCtx.globalAlpha = alpha;
        this.drawingService.previewCtx.globalAlpha = alpha;
    }

    swapColor(): void {
        const temporaire = this.RGBA_P;
        this.RGBA_P = this.RGBA_S;
        this.RGBA_S = temporaire;

        this.drawingService.changeColor(this.RGBA_P, this.RGBA_S);
    }

    formatLabel(value: number): string {
        if (value === 0) {
            return 0 + '';
        }
        // tslint:disable-next-line: no-magic-numbers
        return value / 100 + '';
    }
}
