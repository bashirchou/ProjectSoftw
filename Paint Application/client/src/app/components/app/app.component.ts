import { Component, HostListener } from '@angular/core';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private keyHandlerService: KeyHandlerService) {}
    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.keyHandlerService.onKeyDown(event);
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.keyHandlerService.onKeyUp(event);
    }
}
