import { KeyValuePipe } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { errorMessages, Image } from '@app/classes/constant';
import { Tag } from '@app/classes/tag';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Message } from '@common/communication/message';
import { Subject } from 'rxjs';
import { SaveServerPopupComponent } from './save-server-popup.component';

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

describe('SaveServerPopupComponent', () => {
    let component: SaveServerPopupComponent;
    let fixture: ComponentFixture<SaveServerPopupComponent>;
    let subject: Subject<Message>;
    let postRequestSpy: jasmine.Spy;
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
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
                declarations: [SaveServerPopupComponent, KeyValuePipe],
                providers: [
                    { provide: HttpClientTestingModule, usevalue: {} },
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
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveServerPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        subject = new Subject<Message>();
        // tslint:disable-next-line: no-string-literal
        postRequestSpy = spyOn(component['serverCommunicationService'], 'getObserverFromServerWritingImage').and.callFake(() => {
            return subject.asObservable();
        });
    });
    afterEach(() => {
        component.dialog.closeAll();
        subject.complete();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('When the user cancel the dialog should be close', () => {
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(component['dialogRef'], 'close').and.callFake(() => {
            // EMTPY
        });
        component.onCancel();
        expect(spy).toHaveBeenCalled();
    });

    it('onConfirm should try to write the right data on the server', () => {
        const tag = new Tag('test');
        component.data.imageFormat = 'image/png';
        component.data.name = 'test';
        component.data.tags = [tag];

        component.onConfirm();
        const imageToWrite = {
            title: 'test',
            tags: ['test'],
            // tslint:disable-next-line: no-string-literal
            data: component['drawingService'].canvas.toDataURL('image/png'),
        } as Image;
        expect(postRequestSpy).toHaveBeenCalledWith(imageToWrite);
    });

    it('dataWasWrittenInServer should handle a successfull image write in the server', () => {
        component.postOnServer = true;
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        const spySuccess = spyOn(component, 'writingSuccess').and.callThrough();
        component.onConfirm();
        subject.next({} as Message);
        expect(spy).toHaveBeenCalled();
        expect(component.postOnServer).toBeFalse();
        expect(spySuccess).toHaveBeenCalled();
    });

    it('if a error is throw it should be handle if it is known', () => {
        const error = ({
            name: errorMessages.keys().next().value,
            message: 'test',
        } as unknown) as HttpErrorResponse;
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component.onConfirm();
        subject.error(error);
        expect(spy).toHaveBeenCalled();
    });

    it('if a error is throw it should be handle if it is not known', () => {
        const error = ({
            name: 'NOT_A_KNOW_ERROR_NAME',
            message: 'test',
        } as unknown) as HttpErrorResponse;
        const spy = spyOn(component.dialog, 'open').and.callThrough();

        component.onConfirm();
        subject.error(error);
        expect(spy).toHaveBeenCalled();
    });

    it('The method should validate the tags', () => {
        component.data.tags = [new Tag('validTag'), new Tag('Invalid tag')];
        component.validTags = true;
        component.validateTags();
        expect(component.validTags).toBeFalse();

        component.data.tags = [new Tag('validTag'), new Tag('validTag')];
        component.validTags = false;
        component.validateTags();
        expect(component.validTags).toBeTrue();
    });

    it('The method add should add a tags', () => {
        const event = { input: {} as HTMLInputElement, value: 'newTag' } as MatChipInputEvent;
        component.add(event);
        let present = false;
        for (const tag of component.data.tags) {
            if (tag.tagName === 'newTag') {
                present = true;
                break;
            }
        }
        expect(present).toBeTrue();
    });

    it('The method remove shoud remove a tag', () => {
        const tag = new Tag('test');
        component.data.tags = [tag];
        component.remove(tag);
        expect(component.data.tags.length).toBe(0);
    });

    it('The method remove not should remove a tag if he is not in the list', () => {
        const tag = new Tag('test');
        component.data.tags = [tag];
        component.remove(new Tag('dwadad'));
        expect(component.data.tags.length).toBe(1);
    });

    it('The method writingSuccess should open a dialog', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();

        // tslint:disable-next-line: no-empty
        component.writingSuccess();
        expect(spy).toHaveBeenCalled();
    });
});
