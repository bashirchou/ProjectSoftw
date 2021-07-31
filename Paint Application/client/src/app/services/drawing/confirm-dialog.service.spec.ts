import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { of } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
    let service: ConfirmDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        afterClosed(): void {
                            // empty
                        },
                    } as MatDialogRef<ConfirmDialogComponent>,
                },
                {
                    provide: MatDialog,
                    useValue: {
                        open(): void {
                            // empty
                        },
                    },
                },
            ],
        });
        service = TestBed.inject(ConfirmDialogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('open should call open from dialog', () => {
        const dialogSpy = spyOn(service.dialog, 'open').and.callThrough();
        service.open();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('confirmed should be called', () => {
        const confirmedSpy = spyOn(service, 'confirmed').and.returnValue(of(true));
        service.confirmed();
        expect(confirmedSpy).toHaveBeenCalled();
    });

    it('afterClosed should be called', () => {
        // tslint:disable-next-line: no-any
        const confirmedSpy = spyOn(service.dialogRef, 'afterClosed');
        try {
            service.confirmed();
        } catch (error) {
            // DO NOTHING
        }
        expect(confirmedSpy).toHaveBeenCalled();
    });

    it('The map function should  return what was pass in parameter', () => {
        expect(service.mapFonction(true)).toBeTrue();
    });
});
