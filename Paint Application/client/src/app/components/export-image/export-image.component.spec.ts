import { KeyValuePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogConfig, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DataImgur, ImgurDataPost } from '@app/classes/constant';
import { Tag } from '@app/classes/tag';
import { DisplayImagesComponent } from '@app/components/display-images/display-images.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subject } from 'rxjs';
import { ExportImageComponent } from './export-image.component';
class DrawingServiceMock {
    canvas: HTMLCanvasElement = new CanvasTestHelper().canvas;
    baseCtx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    isPointsOnCanvas(x: number, y: number): boolean {
        return x <= this.canvas.width && x >= 0 && y <= this.canvas.height && y >= 0;
    }
    getPixelColor(): string {
        return '#ffffff';
    }
}

describe('ExportImageComponent', () => {
    let component: ExportImageComponent;
    let fixture: ComponentFixture<ExportImageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                MatDialogModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                MatSelectModule,
                MatChipsModule,
                MatFormFieldModule,
                MatInputModule,
                FormsModule,
            ],
            declarations: [ExportImageComponent, KeyValuePipe],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close(): void {
                            // EMPTY
                        },
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        name: '',
                        tags: [] as Tag[],
                        imageFormat: '',
                    },
                },
                { provide: DrawingService, useValue: new DrawingServiceMock() },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportImageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    afterEach(() => {
        component.dialog.closeAll();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('When the user cancel the dialog should be close', () => {
        // tslint:disable: no-string-literal
        const spy = spyOn(component['dialogRef'], 'close').and.callFake(() => {
            return;
        });
        component.onCancel();
        expect(spy).toHaveBeenCalled();
    });

    it('If filter chosen is equal to 1, the filter should be grayscale', () => {
        component.filter = '1';
        component.filterChoice();
        expect(component['previewCtx'].filter).toEqual('grayscale(1)');
    });
    it('If filter chosen is equal to 2, the filter should be sepia.', () => {
        component.filter = '2';
        component.filterChoice();
        expect(component['previewCtx'].filter).toEqual('sepia(1)');
    });
    it('IF filter chosen is equal to 3, the filter should be saturate', () => {
        component.filter = '3';
        component.filterChoice();
        expect(component['previewCtx'].filter).toEqual('saturate(0.4)');
    });
    it('If filter chosen is equal to 4, the filter should be brightness', () => {
        component.filter = '4';
        component.filterChoice();
        expect(component['previewCtx'].filter).toEqual('brightness(1.5)');
    });
    it('If filter chosen is equal to 5, the filter should be blur', () => {
        component.filter = '5';
        component.filterChoice();
        expect(component['previewCtx'].filter).toEqual('blur(4px)');
    });
    it('If filter chosen is equal to 6, the filter should be blur', () => {
        component.filter = '6';
        component.filterChoice();
        expect(component['previewCtx'].filter).toEqual('none');
    });

    it('On confirm, format should be jpeg if the type chosen is equal to 1', () => {
        component.type = '1';

        const spy = spyOn(component, 'writingSuccess').and.callFake(() => {
            return;
        });
        const spyFilter = spyOn(component, 'filterChoice').and.callFake(() => {
            return;
        });
        component.onConfirm();
        expect(component['format']).toEqual('.jpg');
        expect(spy).toHaveBeenCalled();
        expect(spyFilter).toHaveBeenCalled();
    });

    it('On confirmImgur, format should be jpeg if the type chosen is equal to 1', () => {
        component.type = '1';
        const subject = new Subject<ImgurDataPost>();

        const spy = spyOn(component, 'editLink').and.callFake((link: string) => {
            return;
        });
        const spyFilter = spyOn(component, 'filterChoice').and.callFake(() => {
            return;
        });

        const spyServer = spyOn(component['serverCommunicationService'], 'getObserverFromServerWritingImageImgur').and.callFake((link: string) => {
            return subject.asObservable();
        });
        const imgurDataPost = {
            data: { link: 't' },
            success: true,
            status: 200,
        } as ImgurDataPost;
        component.onConfirmImgur();
        subject.next(imgurDataPost);
        expect(component['format']).toEqual('.jpeg');
        expect(spy).toHaveBeenCalled();
        expect(spyServer).toHaveBeenCalled();
        expect(spyFilter).toHaveBeenCalled();
    });

    it('onConfirmImgur should try to write the right data in Imgur', () => {
        component.type = '1';
        const subject = new Subject<ImgurDataPost>();

        const imgurDataPost = {
            data: { link: 't' },
            success: true,
            status: 200,
        } as ImgurDataPost;
        const spy = spyOn(component, 'editLink').and.callFake((link: string) => {
            return;
        });
        const spyServer = spyOn(component['serverCommunicationService'], 'getObserverFromServerWritingImageImgur').and.callFake((link: string) => {
            return subject.asObservable();
        });
        const spyFilter = spyOn(component, 'filterChoice').and.callFake(() => {
            return;
        });
        component.onConfirmImgur();
        subject.next(imgurDataPost);
        expect(spy).toHaveBeenCalled();
        expect(spyServer).toHaveBeenCalled();
        expect(spyFilter).toHaveBeenCalled();
    });

    it('editLink should change the link and call writingSuccessImgur', () => {
        const spy = spyOn(component, 'writingSuccessImgur').and.callFake(() => {
            return;
        });
        component.editLink('test');
        expect(component['link']).toBe('test');
        expect(spy).toHaveBeenCalled();
    });

    it('Should open the writing sucesse', () => {
        const ob1 = new Subject<void>();
        // tslint:disable-next-line: no-any
        const ob2 = new Subject<any>();
        const mockDialogRef = {
            afterOpened: () => {
                return ob1.asObservable();
            },
            afterClosed: () => {
                // tslint:disable-next-line: no-any
                return ob2.asObservable();
            },
        };

        const openSpy = spyOn(component.dialog, 'open').and.callFake(() => {
            // tslint:disable-next-line: no-any
            return mockDialogRef as MatDialogRef<DisplayImagesComponent, MatDialogConfig<any>>;
        });

        component.writingSuccess();
        expect(openSpy).toHaveBeenCalled();

        ob1.next();
        expect(component['keyHandlerService'].isShortcutActive).toBeFalse();
        ob1.complete();

        ob2.next([]);
        expect(component['keyHandlerService'].isShortcutActive).toBeTrue();
        ob2.next(undefined);
        ob2.complete();
    });

    it('Should open the writing sucesse in imgur', () => {
        const ob1 = new Subject<void>();
        // tslint:disable-next-line: no-any
        const ob2 = new Subject<any>();
        const mockDialogRef = {
            afterOpened: () => {
                return ob1.asObservable();
            },
            afterClosed: () => {
                // tslint:disable-next-line: no-any
                return ob2.asObservable();
            },
        };

        const openSpy = spyOn(component.dialog, 'open').and.callFake(() => {
            // tslint:disable-next-line: no-any
            return mockDialogRef as MatDialogRef<DisplayImagesComponent, MatDialogConfig<any>>;
        });

        component.writingSuccessImgur();
        expect(openSpy).toHaveBeenCalled();

        ob1.next();
        expect(component['keyHandlerService'].isShortcutActive).toBeFalse();
        ob1.complete();

        ob2.next([]);
        expect(component['keyHandlerService'].isShortcutActive).toBeTrue();
        ob2.next(undefined);
        ob2.complete();
    });

    it('onConfirmImgur should call writingSuccessImgur after success', () => {
        const spy = spyOn(component, 'writingSuccessImgur').and.callFake(() => {
            return;
        });
        const success = true;
        const status = 200;
        const data: DataImgur = {
            account_id: 0,
            account_url: null,
            ad_type: 0,
            ad_url: '',
            animated: false,
            bandwidth: 0,
            datetime: 1618523011,
            deletehash: 'pdNKivOOuRzjxpx',
            description: 'null',
            favorite: false,
            height: 600,
            id: 'obFw41x',
            in_gallery: false,
            in_most_viral: false,
            is_ad: false,
            link: 'https://i.imgur.com/obFw41x.png',
            name: '',
            nsfw: null,
            section: null,
            size: 30802,
            tags: [],
            title: 'null',
            type: 'image/png',
            views: 0,
            vote: null,
            width: 1000,
        };
        const x: ImgurDataPost = { data, success, status };
        component.type = '1';
        const ob1 = new Subject<ImgurDataPost>();
        spyOn(component['serverCommunicationService'], 'getObserverFromServerWritingImageImgur').and.callFake((link: string) => {
            return ob1.asObservable();
        });
        component.onConfirmImgur();
        ob1.next(x);
        expect(spy).toHaveBeenCalled();
        expect(component['link']).toBeDefined();
        ob1.complete();
    });

    it('editLink should call writingSuccessImgur after success', () => {
        const link = 'allo';
        component.editLink(link);
        expect(component['link']).toEqual('allo');
    });
});
