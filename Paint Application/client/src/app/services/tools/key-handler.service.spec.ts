import { TestBed } from '@angular/core/testing';
import { ToolSelector } from '@app/classes/constant';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/tools/grid.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { ToolsControllerService } from '@app/services/tools/tools-controller.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { Observer, Subject } from 'rxjs';

const createMockKeyboardEvent = (keyPress: string): KeyboardEvent => {
    // tslint:disable-next-line: no-empty
    return { key: keyPress, preventDefault: () => {}, stopPropagation: () => {} } as KeyboardEvent;
};

describe('KeyHandlerService', () => {
    let service: KeyHandlerService;
    let toolControler: ToolsControllerService;
    let nextCalled = false;
    const observer = {
        next: (shortcut: string) => {
            nextCalled = true;
        },
        error: (err) => {
            return;
        },
        complete: () => {
            return;
        },
    } as Observer<string>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: ToolsControllerService, useValue: toolControler }],
        });
        service = TestBed.inject(KeyHandlerService);
        toolControler = new ToolsControllerService({} as DrawingService, service, {} as UndoRedoService, {} as GridService);
        nextCalled = false;
        // tslint:disable-next-line: no-string-literal
        service['shorcuts'].set('control o', new Subject<string>());
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add the key', () => {
        const keydown = createMockKeyboardEvent('2');
        service.onKeyDown(keydown);
        // tslint:disable-next-line: no-string-literal
        expect(service['keys'].has('2')).toBeTrue();
    });

    it('should remove the key', () => {
        const keyup = createMockKeyboardEvent('2');
        // tslint:disable-next-line: no-string-literal
        service['keys'].add('2');
        service.onKeyUp(keyup);
        // tslint:disable-next-line: no-string-literal
        expect(service['keys'].has('2')).toBeFalse();
    });

    it('The method isKeyDown should return if the key is down', () => {
        // tslint:disable-next-line: no-string-literal
        service['keys'].add('2');
        expect(service.isKeyDown('2')).toBeTrue();
        expect(service.isKeyDown('0')).toBeFalse();
    });

    it('When a Toolshortcut is pressed the currentToolShouldChange', () => {
        toolControler.setCurrentTool(ToolSelector.Ellipse);
        const shortcutRectangle = '1';
        const keydown = createMockKeyboardEvent(shortcutRectangle);
        service.onKeyDown(keydown);
        expect(toolControler.currentToolSelector).toBe(ToolSelector.Rectangle);
    });

    it('When a shortcut is pressed the next function of taht shortcut should be called', () => {
        // tslint:disable-next-line: deprecation
        const subscription = service.getObservableFromShortcut('control o').subscribe(observer);
        service.onKeyDown(createMockKeyboardEvent('control'));
        service.onKeyDown(createMockKeyboardEvent('o'));

        expect(nextCalled).toBeTrue();
        subscription.unsubscribe();
    });

    it('When a key that is not a shortcut is press it should do nothing', () => {
        // tslint:disable-next-line: deprecation
        const subscription = service.getObservableFromShortcut('control o').subscribe(observer);
        toolControler.setCurrentTool(ToolSelector.Ellipse);
        const invalidKey = 'THIS_IS_NOT_A_SHORTCUT';
        const keydown = createMockKeyboardEvent(invalidKey);
        service.onKeyDown(keydown);
        expect(toolControler.currentToolSelector).toBe(ToolSelector.Ellipse);
        expect(nextCalled).toBeFalse();
        subscription.unsubscribe();
    });

    it('When a shortcut is pressed but they are not activated, it should do nothing', () => {
        service.isShortcutActive = false;
        const spy = spyOn(toolControler, 'setCurrentTool').and.callThrough();
        const shortcutRectangle = '1';
        const keydown = createMockKeyboardEvent(shortcutRectangle);
        // tslint:disable-next-line: deprecation
        const subscription = service.getObservableFromShortcut('control o').subscribe(observer);
        service.onKeyDown(createMockKeyboardEvent('control'));
        service.onKeyDown(createMockKeyboardEvent('o'));
        service.onKeyDown(keydown);
        service.onKeyDown(createMockKeyboardEvent('control'));
        service.onKeyDown(createMockKeyboardEvent('o'));
        expect(spy).not.toHaveBeenCalled();
        expect(nextCalled).toBeFalse();
        subscription.unsubscribe();
    });

    it('Should create a shortcut if the shortcut does not exist', () => {
        const observable = service.getObservableFromShortcut('FAKE_SHORTCUT');

        expect(JSON.stringify(observable)).toBe(JSON.stringify(service.getObservableFromShortcut('FAKE_SHORTCUT')));
        // tslint:disable-next-line: no-string-literal
        expect(service['shorcuts'].has('FAKE_SHORTCUT')).toBeTrue();
    });

    it('If the shorcuts are disable, browser shorcuts should be block', () => {
        const keyboardEvent = {
            key: 'z',
            // tslint:disable-next-line: no-empty
            preventDefault: () => {},
            // tslint:disable-next-line: no-empty
            stopPropagation: () => {},
            ctrlKey: true,
            altKey: false,
            metaKey: false,
        } as KeyboardEvent;
        service.isShortcutActive = false;
        const spyDefault = spyOn(keyboardEvent, 'preventDefault').and.callThrough();
        const spyProp = spyOn(keyboardEvent, 'stopPropagation').and.callThrough();
        service.onKeyDown(keyboardEvent);
        expect(spyDefault).toHaveBeenCalled();
        expect(spyProp).toHaveBeenCalled();
    });
});
