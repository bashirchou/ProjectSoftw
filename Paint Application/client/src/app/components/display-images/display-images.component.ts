import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    CANVAS_HEIGHT_RECISE,
    CANVAS_WIDTH_RECISE,
    DialogDataDisplayServer,
    errorMessages,
    maxTimeToWaitForServer,
    supportedChromeCanvasImages,
} from '@app/classes/constant';
import { Tag } from '@app/classes/tag';
import { DelayDialogComponent } from '@app/components/delay-dialog/delay-dialog.component';
import { MessageDisplayerComponent } from '@app/components/message-displayer/message-displayer.component';
import { ServerCommunicationService } from '@app/services/communication/server-communication.service';
import { CarouselService } from '@app/services/drawing/carousel.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { ImageDb, ImageId } from '@common/communication/image';
import { Message } from '@common/communication/message';
import { timeout } from 'rxjs/operators';

@Component({
    selector: 'display-images.component',
    templateUrl: './display-images.component.html',
    styleUrls: ['./display-images.component.scss'],
})
export class DisplayImagesComponent implements AfterViewInit {
    constructor(
        public dialogRef: MatDialogRef<DisplayImagesComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogDataDisplayServer,
        private serverCommunicationService: ServerCommunicationService,
        public dialog: MatDialog,
        private toolsControllerService: ToolsControllerService,
        private drawingService: DrawingService,
        private undoRedoService: UndoRedoService,
        public carouselService: CarouselService,
    ) {
        this.supportedChromeCanvasImages = supportedChromeCanvasImages;
        this.data.listImage = [];
        this.data.tagsCarousel = [];
        this.initializeData();
    }
    @ViewChild('canvas0', { static: true }) canvas0: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas1', { static: true }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: true }) canvas2: ElementRef<HTMLCanvasElement>;

    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    supportedChromeCanvasImages: Map<string, string>;
    private canvasArrayMaxLength: number = 3;
    private ctx0: CanvasRenderingContext2D;
    private ctx1: CanvasRenderingContext2D;
    private ctx2: CanvasRenderingContext2D;
    private img0: HTMLImageElement = new Image();
    private img1: HTMLImageElement = new Image();
    private img2: HTMLImageElement = new Image();
    private imgCharger: HTMLImageElement = new Image();

    onCancel(): void {
        this.dialogRef.close();
        this.data.tagsCarousel.length = 0;
    }
    initializeData(): void {
        this.serverCommunicationService
            .getObserverFromServerGetAllImageWithData()
            .pipe(timeout(maxTimeToWaitForServer))
            // tslint:disable-next-line: deprecation
            .subscribe({
                next: (x: ImageDb[]) => {
                    this.placeDataInArrayImage(x);
                    this.placeDataInArrayImageClone(x);
                },
            });
    }
    deleteImage(imageDelete: ImageDb): void {
        this.serverCommunicationService
            .deleteObserverFromServerDeleteDatabaseAndServer((imageDelete._id as unknown) as ImageId)
            .pipe(timeout(maxTimeToWaitForServer))
            // tslint:disable-next-line: deprecation
            .subscribe({
                next: (data: Message) => this.dataWasDeletedInServer(),
                error: (error: HttpErrorResponse) => this.manageError(error),
            });
        for (let i = 0; i < this.data.listImage.length; i++) {
            if (this.data.listImage[i] === imageDelete) {
                this.data.listImage.splice(i, 1);
            }
        }
        this.data.tagsCarousel = [];
        this.carouselService.setFilterOfArrayImage(this.data.listImage, this.data.tagsCarousel);
        this.setUpImageDisplayCarousel(this.carouselService.arrayImageTagFilter);
    }
    dataWasDeletedInServer(): void {
        this.deletingSuccess();
    }
    deletingSuccess(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            title: 'Félicitation !',
            message: 'Votre dessin a bien été supprimer sur le serveur',
        };
        this.dialog.open(MessageDisplayerComponent, dialogConfig);
    }

    placeDataInArrayImage(x: ImageDb[]): void {
        for (const imageDb of x) {
            this.data.listImage.push(imageDb);
        }
    }

    placeDataInArrayImageClone(x: ImageDb[]): void {
        for (const imageDb of x) {
            this.carouselService.arrayImageTagFilter.push(imageDb);
        }
        this.carouselService.setFilterOfArrayImage(this.data.listImage, this.data.tagsCarousel);
        this.setUpImageDisplayCarousel(this.carouselService.arrayImageTagFilter);
    }

    setUpImageDisplayCarousel(x: ImageDb[]): void {
        if (x.length >= this.canvasArrayMaxLength) {
            this.carouselService.arrayCarousel = [0, 1, 2];
            // tslint:disable-next-line: prefer-switch
        } else if (x.length === 2) {
            this.carouselService.arrayCarousel = [0, 1];
            this.carouselService.ctxArray[2].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
        } else if (x.length === 1) {
            this.carouselService.arrayCarousel = [0];
            this.carouselService.ctxArray[2].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
            this.carouselService.ctxArray[1].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
        } else if (x.length === 0) {
            this.carouselService.arrayCarousel = [];
            this.carouselService.ctxArray[2].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
            this.carouselService.ctxArray[1].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
            this.carouselService.ctxArray[0].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
        }

        this.carouselService.ifTitleNull(this.carouselService.arrayCarousel.length);
    }
    chargerImage(data: string): void {
        this.imgCharger.src = data;
        this.toolsControllerService.drawingService.baseCtx.drawImage(this.imgCharger, 0, 0);
        this.onCancel();
        this.chargingData();
    }

    displayImage(data: string, canvasPos: number): void {
        if (data != undefined) {
            // tslint:disable-next-line: prefer-switch
            if (canvasPos === 0) {
                this.carouselService.ctxArray[canvasPos].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
                this.img0.src = data;
                this.carouselService.ctxArray[canvasPos].drawImage(this.img0, 0, 0, CANVAS_WIDTH_RECISE, CANVAS_HEIGHT_RECISE);
            } else if (canvasPos === 1) {
                this.carouselService.ctxArray[canvasPos].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
                this.img1.src = data;
                this.carouselService.ctxArray[canvasPos].drawImage(this.img1, 0, 0, CANVAS_WIDTH_RECISE, CANVAS_HEIGHT_RECISE);
            } else if (canvasPos === 2) {
                this.carouselService.ctxArray[canvasPos].clearRect(0, 0, this.canvas0.nativeElement.width, this.canvas0.nativeElement.height);
                this.img2.src = data;
                this.carouselService.ctxArray[canvasPos].drawImage(this.img2, 0, 0, CANVAS_WIDTH_RECISE, CANVAS_HEIGHT_RECISE);
            }
        }
    }
    ngAfterViewInit(): void {
        this.ctx0 = this.canvas0.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.carouselService.ctxArray = [this.ctx0, this.ctx1, this.ctx2];
    }

    dataWasWrittenInServer(data: Message): void {
        this.dialogRef.close(data);
        // this.postOnServer = false;
        this.writingSuccess();
    }
    manageError(error: HttpErrorResponse): void {
        let errorMessage = errorMessages.get(error.name);
        if (errorMessage == undefined) {
            errorMessage = 'Erreur inconnue: ' + error.message;
        }
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            title: 'Une erreur est survenu...',
            message: errorMessage,
        };
        this.dialog.open(MessageDisplayerComponent, dialogConfig);
        // this.postOnServer = false;
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if (value.trim().toLowerCase()) {
            this.data.tagsCarousel.push(new Tag(value.trim()));
        }
        if (input) {
            input.value = '';
        }

        this.carouselService.validateTags(this.data.tagsCarousel);
        this.carouselService.setFilterOfArrayImage(this.data.listImage, this.data.tagsCarousel);
        this.setUpImageDisplayCarousel(this.carouselService.arrayImageTagFilter);
    }
    remove(tag: Tag): void {
        const index = this.data.tagsCarousel.indexOf(tag);
        if (index >= 0) {
            this.data.tagsCarousel.splice(index, 1);
        }
        this.carouselService.validateTags(this.data.tagsCarousel);
        this.carouselService.setFilterOfArrayImage(this.data.listImage, this.data.tagsCarousel);
        this.setUpImageDisplayCarousel(this.carouselService.arrayImageTagFilter);
        this.carouselService.card1Title = true;
        this.carouselService.card2Title = true;
        this.carouselService.card3Title = true;
    }
    writingSuccess(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            title: 'Félicitation !',
            message: 'Votre dessin a bien été sauvegarder sur le serveur',
        };
        this.dialog.open(MessageDisplayerComponent, dialogConfig);
    }
    chargingData(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            title: 'Votre dessin sera transferer sous peu',
            message: 'Veuillier patienter',
        };
        this.dialog.open(DelayDialogComponent, dialogConfig);
        this.drawingService.saveCanvas();
        this.undoRedoService.clearHistory();
    }
    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'ArrowRight') {
            this.carouselService.avancerCarousel();
        } else if (event.key === 'ArrowLeft') {
            this.carouselService.reculerCarousel();
        }
    }
    // tslint:disable-next-line: max-file-line-count
}
