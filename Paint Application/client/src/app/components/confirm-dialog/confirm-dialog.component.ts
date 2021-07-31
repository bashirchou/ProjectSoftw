import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            cancelText: string;
            confirmText: string;
            message: string;
            title: string;
        },
        public mdDialogRef: MatDialogRef<ConfirmDialogComponent>,
    ) {}
    cancel(): void {
        this.close(false);
    }
    close(value: boolean): void {
        this.mdDialogRef.close(value);
    }
    confirm(): void {
        this.close(true);
    }
}
