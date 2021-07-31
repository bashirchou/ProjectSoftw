import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataSaveServer, errorMessages, Image, maxTimeToWaitForServer, supportedChromeCanvasImages } from '@app/classes/constant';
import { Tag } from '@app/classes/tag';
import { MessageDisplayerComponent } from '@app/components/message-displayer/message-displayer.component';
import { ServerCommunicationService } from '@app/services/communication/server-communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Message } from '@common/communication/message';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Component({
    selector: 'app-save-server-poppup',
    templateUrl: './save-server-popup.component.html',
    styleUrls: ['./save-server-popup.component.scss'],
})
export class SaveServerPopupComponent {
    visible: boolean = true;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    supportedChromeCanvasImages: Map<string, string>;

    validName: boolean = false;
    validTags: boolean = true;
    postOnServer: boolean = false;

    postRequestSubscription: Subscription;
    constructor(
        public dialogRef: MatDialogRef<SaveServerPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogDataSaveServer,
        private drawingService: DrawingService,
        private serverCommunicationService: ServerCommunicationService,
        public dialog: MatDialog,
    ) {
        this.supportedChromeCanvasImages = supportedChromeCanvasImages;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    async onConfirm(): Promise<void> {
        const dataUrl = this.drawingService.canvas.toDataURL(this.data.imageFormat);
        const tagsString = [] as string[];
        for (const tag of this.data.tags) {
            tagsString.push(tag.tagName);
        }
        const imageToWrite = {
            title: this.data.name,
            tags: tagsString,
            data: dataUrl,
        } as Image;
        this.postOnServer = true;
        // tslint:disable-next-line: deprecation
        this.postRequestSubscription = this.serverCommunicationService
            .getObserverFromServerWritingImage(imageToWrite)
            .pipe(timeout(maxTimeToWaitForServer))
            // tslint:disable-next-line: deprecation
            .subscribe({
                next: (data: Message) => this.dataWasWrittenInServer(data),
                error: (error: HttpErrorResponse) => this.handleError(error),
                complete: () => {
                    this.postRequestSubscription.unsubscribe();
                },
            });
    }
    dataWasWrittenInServer(data: Message): void {
        this.dialogRef.close(data);
        this.postOnServer = false;
        this.writingSuccess();
    }

    handleError(error: HttpErrorResponse): void {
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
        this.postOnServer = false;
    }

    validateTags(): void {
        if (this.data.tags.length === 0) {
            this.validTags = true;
            return;
        }
        for (const tag of this.data.tags) {
            if (!tag.isValidTag()) {
                this.validTags = false;
                return;
            }
        }
        this.validTags = true;
    }
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (value.trim().toLowerCase()) {
            this.data.tags.push(new Tag(value.trim()));
        }

        if (input) {
            input.value = '';
        }
        this.validateTags();
    }

    remove(tag: Tag): void {
        const index = this.data.tags.indexOf(tag);

        if (index >= 0) {
            this.data.tags.splice(index, 1);
        }
        this.validateTags();
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
}
