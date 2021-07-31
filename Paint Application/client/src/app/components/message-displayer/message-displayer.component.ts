import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataMessge } from '@app/classes/constant';

@Component({
    selector: 'app-message-displayer',
    templateUrl: './message-displayer.component.html',
    styleUrls: ['./message-displayer.component.scss'],
})
export class MessageDisplayerComponent {
    constructor(public dialogRef: MatDialogRef<MessageDisplayerComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogDataMessge) {}
}
