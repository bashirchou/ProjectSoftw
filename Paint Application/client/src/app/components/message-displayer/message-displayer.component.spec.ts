import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageDisplayerComponent } from './message-displayer.component';

describe('MessageDisplayerComponent', () => {
    let component: MessageDisplayerComponent;
    let fixture: ComponentFixture<MessageDisplayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageDisplayerComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close(): void {
                            // Empty
                        },
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageDisplayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        component.dialogRef.close();
    });
});
