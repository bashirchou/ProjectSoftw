import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ApplicationShortcut, DialogDataDisplayServer, DialogDataSaveServer } from '@app/classes/constant';
import { Tag } from '@app/classes/tag';
import { DisplayImagesComponent } from '@app/components/display-images/display-images.component';
import { ExportImageComponent } from '@app/components/export-image/export-image.component';
import { SaveServerPopupComponent } from '@app/components/save-server-popup/save-server-popup.component';
import { ConfirmDialogCarouselService } from '@app/services/drawing/confirm-carousel-dialog.service';
import { ConfirmDialogService } from '@app/services/drawing/confirm-dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { ImageDb } from '@common/communication/image';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
    private nameSave: string = '';
    private tagsCarou: Tag[] = [];
    private tagsSave: Tag[] = [];
    private imageFormat: string = 'image/png';
    private imageList: ImageDb[] = [];
    constructor(
        private toolsControllerService: ToolsControllerService,
        private dialogService: ConfirmDialogService,
        private keyHandlerService: KeyHandlerService,
        private dialogCarouselService: ConfirmDialogCarouselService,
        public undoRedoService: UndoRedoService,
        private drawingService: DrawingService,
        public dialog: MatDialog,
    ) {
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut(ApplicationShortcut.newDraw).subscribe((shortcut: string) => this.newDrawShortcut());
        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut(ApplicationShortcut.save).subscribe((shortcut: string) => this.saveDrawShorcut());

        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut(ApplicationShortcut.exportDraw).subscribe((shortcut: string) => this.exportDrawShortcut());

        // tslint:disable-next-line: deprecation
        this.keyHandlerService.getObservableFromShortcut(ApplicationShortcut.carousel).subscribe((shortcut: string) => this.newCarouselShorcut());
    }

    newDrawShortcut(): void {
        this.openNewDrawDialog();
    }

    newCarouselShorcut(): void {
        this.openDialogCarousel();
    }

    saveDrawShorcut(): void {
        this.openSaveDrawDialog();
    }
    exportDrawShortcut(): void {
        this.openExportImageDialog();
    }

    openNewDrawDialog(): void {
        this.dialogService.open();

        // tslint:disable-next-line: deprecation
        this.dialogService.confirmed().subscribe((confirmed: boolean) => this.newDraw(confirmed));
    }

    openDialogCarousel(): void {
        if (this.drawingService.isCanvasEmpty()) {
            this.openCarousel();
        } else {
            this.dialogCarouselService.open();

            // tslint:disable-next-line: deprecation
            this.dialogCarouselService.confirmed().subscribe((confirmed: boolean) => this.newCarousel(confirmed));
        }
    }
    openSaveDrawDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            name: this.nameSave,
            tags: this.tagsSave,
            imageFormat: this.imageFormat,
        };
        const dialogRef = this.dialog.open(SaveServerPopupComponent, dialogConfig);

        // tslint:disable-next-line: deprecation
        dialogRef.afterOpened().subscribe(() => this.afterOpenedSaveDialog());
        // tslint:disable-next-line: deprecation
        dialogRef.afterClosed().subscribe((result: DialogDataSaveServer) => this.afterClosedSaveDialog(result));
    }

    openCarousel(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            tagsCarousel: this.tagsCarou,
            imageList: this.imageList,
        };
        const dialogRef = this.dialog.open(DisplayImagesComponent, dialogConfig);

        // tslint:disable-next-line: deprecation
        dialogRef.afterOpened().subscribe(() => {
            this.keyHandlerService.isShortcutActive = false;
        });
        // tslint:disable-next-line: deprecation
        dialogRef.afterClosed().subscribe((result: DialogDataDisplayServer) => {
            if (result != undefined) {
                this.tagsCarou = [];
            }
            this.keyHandlerService.isShortcutActive = true;
        });
    }
    openExportImageDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.closeOnNavigation = true;
        dialogConfig.data = {
            name: this.nameSave,
            tags: this.tagsSave,
            imageFormat: this.imageFormat,
        };
        const dialogRef = this.dialog.open(ExportImageComponent, dialogConfig);
        // tslint:disable-next-line: deprecation
        dialogRef.afterOpened().subscribe(() => {
            this.keyHandlerService.isShortcutActive = false;
        });
        // tslint:disable-next-line: deprecation
        dialogRef.afterClosed().subscribe((result: DialogDataDisplayServer) => {
            if (result != undefined) {
                this.tagsCarou = [];
            }
            this.keyHandlerService.isShortcutActive = true;
        });
    }
    afterOpenedSaveDialog(): void {
        this.keyHandlerService.isShortcutActive = false;
    }
    afterClosedSaveDialog(result: DialogDataSaveServer | undefined): void {
        if (result != undefined) {
            this.tagsSave = [];
            this.nameSave = '';
        }
        this.keyHandlerService.isShortcutActive = true;
    }

    newDraw(confirmedNewDraw: boolean): void {
        if (confirmedNewDraw) {
            this.toolsControllerService.drawingService.clearCanvas(this.toolsControllerService.drawingService.baseCtx);
            this.undoRedoService.clearHistory();
        }
    }
    newCarousel(confirmedNewDraw: boolean): void {
        if (confirmedNewDraw) {
            this.newDraw(confirmedNewDraw);
            this.openCarousel();
        }
    }
    get ApplicationShortcut(): typeof ApplicationShortcut {
        return ApplicationShortcut;
    }
    undo(): void {
        this.undoRedoService.undo();
    }
    redo(): void {
        this.undoRedoService.redo();
    }
}
