import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DelayDialogComponent } from './delay-dialog.component';

describe('DelayDialogComponent', () => {
    let component: DelayDialogComponent;
    let fixture: ComponentFixture<DelayDialogComponent>;

    // tslint:disable-next-line: deprecation
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DelayDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close(): void {
                            // empty
                        },
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DelayDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
