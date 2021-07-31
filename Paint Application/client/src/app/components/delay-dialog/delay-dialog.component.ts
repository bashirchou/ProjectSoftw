import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataMessge } from '@app/classes/constant';

@Component({
    selector: 'app-delay-dialog',
    templateUrl: './delay-dialog.component.html',
    styleUrls: ['./delay-dialog.component.scss'],
})
export class DelayDialogComponent {
    constructor(public dialogRef: MatDialogRef<DelayDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogDataMessge) {
        this.onCancel();
    }

    async onCancel(): Promise<void> {
        const threethousand = 1000;
        await this.delay(threethousand);
        this.dialogRef.close();
    }

    async delay(ms: number): Promise<number> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
