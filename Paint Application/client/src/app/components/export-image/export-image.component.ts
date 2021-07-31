import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogDataDisplayServer, ImgurDataPost } from '@app/classes/constant';
import { MessageDisplayerComponent } from '@app/components/message-displayer/message-displayer.component';
import { ServerCommunicationService } from '@app/services/communication/server-communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';

@Component({
    selector: 'app-export-image',
    templateUrl: './export-image.component.html',
    styleUrls: ['./export-image.component.scss'],
})
export class ExportImageComponent implements AfterViewInit {
    @ViewChild('previewCanvas', { static: true }) previewCanvas: ElementRef<HTMLCanvasElement>;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    type: string;
    name: string;
    filter: string;
    validName: boolean = false;
    private format: string = '.png';
    private previewCtx: CanvasRenderingContext2D;
    private link: string;

    constructor(
        public dialogRef: MatDialogRef<ExportImageComponent>,
        private drawingService: DrawingService,
        public dialog: MatDialog,
        private serverCommunicationService: ServerCommunicationService,
        private keyHandlerService: KeyHandlerService,
    ) {}

    onCancel(): void {
        this.dialogRef.close();
    }
    ngAfterViewInit(): void {
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx.drawImage(this.drawingService.canvas, 0, 0, this.previewCanvas.nativeElement.width, this.previewCanvas.nativeElement.height);
    }
    filterChoice(): void {
        switch (this.filter) {
            case '1':
                this.previewCtx.filter = 'grayscale(1)';
                break;
            case '2':
                this.previewCtx.filter = 'sepia(1)';
                break;
            case '3':
                this.previewCtx.filter = 'saturate(0.4)';
                break;
            case '4':
                this.previewCtx.filter = 'brightness(1.5)';
                break;

            case '5':
                this.previewCtx.filter = 'blur(4px)';
                break;

            case '6':
                this.previewCtx.filter = 'none';
                break;
            default:
                break;
        }
        this.previewCtx.clearRect(0, 0, this.previewCanvas.nativeElement.width, this.previewCanvas.nativeElement.height);
        this.previewCtx.drawImage(this.drawingService.canvas, 0, 0, this.previewCanvas.nativeElement.width, this.previewCanvas.nativeElement.height);
    }

    async onConfirm(): Promise<void> {
        if (this.type === '1') {
            this.format = '.jpg';
        }
        const a = document.createElement('a');
        this.previewCanvas.nativeElement.width = this.drawingService.canvas.width;
        this.previewCanvas.nativeElement.height = this.drawingService.canvas.height;
        this.dialogRef.close();
        this.filterChoice();
        a.href = this.previewCanvas.nativeElement.toDataURL();
        a.download = this.name + this.format;
        a.click();
        this.writingSuccess();
    }

    onConfirmImgur(): void {
        this.previewCanvas.nativeElement.width = this.drawingService.canvas.width;
        this.previewCanvas.nativeElement.height = this.drawingService.canvas.height;
        this.dialogRef.close();
        this.filterChoice();
        if (this.type === '1') {
            this.format = '.jpeg';
        }

        const dataUrl = this.previewCanvas.nativeElement.toDataURL('image/' + this.format.split('.')[1]);

        const onlyData = dataUrl.split(',')[1];
        this.serverCommunicationService
            .getObserverFromServerWritingImageImgur(onlyData)
            // tslint:disable-next-line: deprecation
            .subscribe({
                next: (x: ImgurDataPost) => {
                    this.editLink(x.data.link);
                },
            });
    }

    editLink(link: string): void {
        this.link = link;
        this.writingSuccessImgur();
    }

    writingSuccess(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            title: 'Félicitation !',
            message: 'Votre dessin est exporté',
        };
        const dialogRef = this.dialog.open(MessageDisplayerComponent, dialogConfig);

        // tslint:disable-next-line: deprecation
        dialogRef.afterOpened().subscribe(() => {
            this.keyHandlerService.isShortcutActive = false;
        });
        // tslint:disable-next-line: deprecation
        dialogRef.afterClosed().subscribe((result: DialogDataDisplayServer) => {
            this.keyHandlerService.isShortcutActive = true;
        });
    }

    writingSuccessImgur(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            title: 'Félicitation !',
            message: 'Votre dessin est exporté sur Imgur, voici votre lien imgur: ' + this.link,
        };
        const dialogRef = this.dialog.open(MessageDisplayerComponent, dialogConfig);

        // tslint:disable-next-line: deprecation
        dialogRef.afterOpened().subscribe(() => {
            this.keyHandlerService.isShortcutActive = false;
        });
        // tslint:disable-next-line: deprecation
        dialogRef.afterClosed().subscribe((result: DialogDataDisplayServer) => {
            this.keyHandlerService.isShortcutActive = true;
        });
    }
}
