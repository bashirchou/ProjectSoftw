import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, dimension } from '@app/classes/constant';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { Message } from '@common/communication/message';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'PolyDessin LOG2990';
    readonly newOption: string = 'Créer un nouveau dessin';
    readonly continueOption: string = 'Continuer un dessin';
    readonly openOption: string = 'Ouvrir le carrousel de dessins';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    placeholder: string = '';
    newCanvas: boolean = true;
    disabled: boolean;
    constructor(private basicService: IndexService, public router: Router, public drawingService: DrawingService) {
        if ((localStorage.getItem('data') as string) === '') this.disabled = false;
        else this.disabled = true;
    }

    continueDraw(): void {
        if (this.router.url !== '/editor') this.router.navigate(['/editor']);
        const imageData = localStorage.getItem('data') as string;
        const image = new Image();
        image.src = imageData as string;
        dimension.x = parseInt(localStorage.getItem('Width') as string, 10);
        dimension.y = parseInt(localStorage.getItem('Height') as string, 10);
        image.onload = () => {
            this.drawingService.baseCtx.drawImage(image, 0, 0);
        };
    }

    newDraw(): void {
        this.router.navigate(['/editor']);
        localStorage.setItem('data', ' ');
        localStorage.setItem('Height', DEFAULT_HEIGHT + 'px');
        localStorage.setItem('Width', DEFAULT_WIDTH + 'px');
        dimension.x = DEFAULT_WIDTH;
        dimension.y = DEFAULT_HEIGHT;
    }

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // tslint:disable-next-line: deprecation
        this.basicService.basicPost(newTimeMessage).subscribe();
    }

    openDrawingSet(): void {
        this.placeholder = 'Does nothing for Sprint 1. Next sprint, it should open a new page.';
    }
    goEditorNew(): void {
        this.newCanvas = true;
        this.router.navigate(['editor']);
    }
    goEditorContinue(): void {
        this.newCanvas = false;
        this.router.navigate(['editor']);
    }

    getMessagesFromServer(): void {
        this.basicService
            .basicGet()
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            // tslint:disable-next-line: deprecation
            .subscribe(this.message);
    }
}
