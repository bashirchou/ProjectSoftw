import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [MatDialogModule],
                declarations: [ConfirmDialogComponent],
                providers: [
                    ConfirmDialogComponent,
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    {
                        provide: MatDialogRef,
                        useValue: {
                            close(): void {
                                // empty
                            },
                        },
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component = TestBed.inject(ConfirmDialogComponent);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('cancel should call close', () => {
        const closeSpy = spyOn(component, 'close').and.callThrough();
        component.cancel();
        expect(closeSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalledWith(false);
    });

    it('confirm should call close', () => {
        const closeSpy = spyOn(component, 'close').and.callThrough();
        component.confirm();
        expect(closeSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalledWith(true);
    });

    it('close should call close of mdDialogRef with true value', () => {
        const mdDialogRefcloseSpy = spyOn(component.mdDialogRef, 'close').and.callThrough();
        component.close(true);
        expect(mdDialogRefcloseSpy).toHaveBeenCalled();
        expect(mdDialogRefcloseSpy).toHaveBeenCalledWith(true);
    });
});
