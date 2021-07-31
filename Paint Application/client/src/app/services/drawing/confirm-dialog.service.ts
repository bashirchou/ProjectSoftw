import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ConfirmDialogService {
    constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

    private titleData: string = 'Voulez-vous créer un nouveau dessin?';
    private messageData: string = 'En créant un nouveau dessin vous effacerer celui-ci';
    private cancelTextData: string = 'NON';
    private confirmTextData: string = 'OUI, NOUVEAU DESSIN';
    open(): void {
        this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.titleData,
                message: this.messageData,
                cancelText: this.cancelTextData,
                confirmText: this.confirmTextData,
            },
        });
    }
    confirmed(): Observable<boolean> {
        return this.dialogRef.afterClosed().pipe(take(1), map(this.mapFonction));
    }

    mapFonction(res: boolean): boolean {
        return res;
    }
}
