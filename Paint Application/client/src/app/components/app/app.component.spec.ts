import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

const createMockKeyboardEvent = (keyPress: string): KeyboardEvent => {
    // tslint:disable-next-line: no-empty
    return { key: keyPress, preventDefault: () => {}, stopPropagation: () => {} } as KeyboardEvent;
};

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule],
                declarations: [AppComponent],
            }).compileComponents();
        }),
    );
    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('The method handleKeyboardEvent should be called when a key is press', () => {
        const keyboardEvent = createMockKeyboardEvent('2');
        // tslint:disable-next-line: no-string-literal
        const keyboardEventSpy = spyOn(component['keyHandlerService'], 'onKeyDown').and.callThrough();
        component.onKeyDown(keyboardEvent);
        expect(keyboardEventSpy).toHaveBeenCalled();
        expect(keyboardEventSpy).toHaveBeenCalledWith(keyboardEvent);
    });

    it('The method onKeyUp should be called when a key is press', () => {
        const keyboardEvent = { key: '2' } as KeyboardEvent;
        // tslint:disable-next-line: no-string-literal
        const keyboardEventSpy = spyOn(component['keyHandlerService'], 'onKeyUp').and.callThrough();
        component.onKeyUp(keyboardEvent);
        expect(keyboardEventSpy).toHaveBeenCalled();
        expect(keyboardEventSpy).toHaveBeenCalledWith(keyboardEvent);
    });
});
