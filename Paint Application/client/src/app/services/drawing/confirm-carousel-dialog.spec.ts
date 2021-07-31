import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogCarouselService } from './confirm-carousel-dialog.service';

describe('ConfirmDialogCarouselService', () => {
    let service: ConfirmDialogCarouselService;
    // tslint:disable-next-line: no-any
    const subject = new Subject<any>();
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        // tslint:disable-next-line: no-any
                        afterClosed(): Observable<any> {
                            return subject.asObservable();
                        },
                    } as MatDialogRef<ConfirmDialogCarouselService>,
                },
                {
                    provide: MatDialog,
                    useValue: {
                        open(): void {
                            return;
                        },
                    },
                },
            ],
        });
        service = TestBed.inject(ConfirmDialogCarouselService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Open should open the dialog !', () => {
        // tslint:disable-next-line: no-any
        const ob1 = new Subject<any>();
        const mockDialogRef = {
            afterClosed: () => {
                // tslint:disable-next-line: no-any
                return ob1.asObservable();
            },
        };

        const openSpy = spyOn(service.dialog, 'open').and.callFake(() => {
            // tslint:disable-next-line: no-any
            return mockDialogRef as MatDialogRef<ConfirmDialogComponent, MatDialogConfig<any>>;
        });
        service.open();
        expect(openSpy).toHaveBeenCalled();
    });

    it('confirmed should call afterclosed', () => {
        const spy = spyOn(service.dialogRef, 'afterClosed').and.callThrough();
        service.confirmed();
        expect(spy).toHaveBeenCalled();
    });
});
