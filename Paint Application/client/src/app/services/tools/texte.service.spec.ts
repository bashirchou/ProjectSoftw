/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { keyCodes, TexteService } from './texte.service';

describe('Service: Texte', () => {
    let service: TexteService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    // tslint:disable-next-line: no-any

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableTrait']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        // tslint:disable-next-line: no-any

        service = TestBed.inject(TexteService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    beforeEach(() => {
        service['text'] = 'Text Aleatoire Pour Les Tests';
        service['cursorIndex'] = service['text'].length;
        service['modeEcriture'] = true;
        service['pathData'] = [{ x: 0, y: 0 } as Vec2];
    });

    it('should create the service', inject([], () => {
        expect(service).toBeTruthy();
    }));

    it('should execute the confirmWriting function on Escape keypress', inject([], () => {
        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(service, 'confirmWriting');
        const event = {
            keyCode: keyCodes.Number0,
            key: 'Escape',
        } as KeyboardEvent;

        service['modeEcriture'] = true;
        service.onKeyDown(event);

        expect(spy).toHaveBeenCalled();
    }));

    it('Should delete the last character on backspace function call, given that the cursor is on the last element of the text.', inject([], () => {
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Backspace',
        } as KeyboardEvent);

        expect(service['text']).toEqual('Text Aleatoire Pour Les Test');
    }));

    it('Should delete a character that is position before the cursor, on backspace function call.', inject([], () => {
        const ELEVEN = 11;
        service['cursorIndex'] = ELEVEN; // Random index.
        // tslint:disable-next-line: no-magic-numbers
        for (let i = 0; i < 5; i++) {
            service.onKeyDown({
                keyCode: keyCodes.Number0,
                key: 'ArrowLeft',
            } as KeyboardEvent);
        }

        // tslint:disable-next-line: no-magic-numbers
        expect(service['cursorIndex']).toEqual(6);

        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Backspace',
        } as KeyboardEvent);

        // tslint:disable-next-line: no-magic-numbers
        expect(service['cursorIndex']).toEqual(5);
    }));

    it('should set the text to null without calling splice on backspace when the text has a length of 1', inject([], () => {
        service['text'] = '1';
        service['cursorIndex'] = service['text'].length;

        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Backspace',
        } as KeyboardEvent);

        expect(service['cursorIndex']).toEqual(0);
    }));

    it(`Should increase the cursorIndex by two if the cursorIndex is
    currently at a position that is two counts beneath the current text length
    and if the next character is a line break`, inject([], () => {
        service['text'] = 'Test string for arrowRight\n\n\n';
        // tslint:disable-next-line: no-magic-numbers
        const initialCursorIndex = (service['cursorIndex'] = service['text'].length - 3);
        const expectedCursorIndex = initialCursorIndex + 1;

        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'ArrowRight',
        } as KeyboardEvent);

        expect(service['cursorIndex']).toEqual(expectedCursorIndex);
    }));

    it('Should decrease the cursor index only if the cursor index is not currently at the beginning onKeyDown with KeyCode of ArrowUp', inject(
        [],
        () => {
            service['text'] = 'Test\nTest\nTest\nTest\nTest\nTest\nTest\nTest\nTest\nTest\n';
            service['cursorIndex'] = service['text'].length;
            const expectedCursorIndex = (service['cursorIndex'] -= service['maxCharByLine']);
            service.onKeyDown({
                keyCode: keyCodes.Number0,
                key: 'ArrowUp',
            } as KeyboardEvent);

            expect(service['cursorIndex']).toEqual(expectedCursorIndex);
        },
    ));

    it('Should increase the cursorIndex by the maxCharByLine value on ArrowDown keypress', inject([], () => {
        service['text'] = `
        Text Aleatoire Pour Les Tests\n
        Text Aleatoire Pour Les Tests\n
        Text Aleatoire Pour Les Tests\n
        Text Aleatoire Pour Les Tests\n
        Text Aleatoire Pour Les Tests\n
        Text Aleatoire Pour Les Tests\n
        Text Aleatoire Pour Les Tests\n
      `;
        service['cursorIndex'] = 0;
        service['maxCharByLine'] = 'Text Aleatoire Pour Les Tests\n'.length;
        const expectedCursorIndex = service['cursorIndex'] + service['maxCharByLine'];
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'ArrowDown',
        } as KeyboardEvent);

        expect(service['cursorIndex']).toEqual(expectedCursorIndex);
    }));

    it('Should delete the characters in front of the cursorIndex, given that there are any. on Delete Keypress', inject([], () => {
        const expectedServiceText = 'Text Aleatoire Pour Les Test';
        service['cursorIndex']--;

        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Delete',
        } as KeyboardEvent);

        expect(service['text']).toEqual(expectedServiceText);
        expect(service['cursorIndex']).toEqual(service['text'].length);
    }));

    it('Should not delete anything or move the cursor if the cursorIndex is already at the end of text, on Delete KeyPress', inject([], () => {
        const spy = spyOn(service, 'drawTextSimple');

        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Delete',
        } as KeyboardEvent);

        expect(spy).not.toHaveBeenCalled();
    }));

    it('Should compute the right location of the cursor position for a given text', inject([], () => {
        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(service['drawingService'].previewCtx, 'moveTo');
        const expectedX = 0;
        const expectedY = 0;
        service['text'] = '';
        service['cursorIndex'] = service['text'].length;

        service.drawCursor();

        expect(spy).toHaveBeenCalledWith(expectedX, expectedY);
    }));

    it('Should compute the right X and Y locations for the cursor, given the first textAlignment from the textAlignList', inject([], () => {
        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(service['drawingService'].previewCtx, 'moveTo');
        const expectedX = 0;
        const expectedY = 0;
        service['lineText'] = [service['text'], service['text'], service['text']];

        service.drawCursor();

        expect(spy).toHaveBeenCalledWith(expectedX, expectedY);
    }));
    it('Should move the index by 2 characters for arrowRight when there is 2 endlines', inject([], () => {
        service['text'] = 'ab\n\nabcde';
        service['cursorIndex'] = 2;
        service['maxCharByLine'] = 'abcde'.length;
        const expectedCursorIndex = service['cursorIndex'] + 2;
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'ArrowRight',
        } as KeyboardEvent);

        expect(service['cursorIndex']).toEqual(expectedCursorIndex);
    }));
    it('Should move the index by 2 characters for ArrowLeft when there is 2 endlines', inject([], () => {
        service['text'] = 'ab\n\nabcde';
        // tslint:disable-next-line: no-magic-numbers
        service['cursorIndex'] = 3;
        service['maxCharByLine'] = 'abcde'.length;
        const expectedCursorIndex = service['cursorIndex'] - 2;
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'ArrowLeft',
        } as KeyboardEvent);

        expect(service['cursorIndex']).toEqual(expectedCursorIndex);
    }));
    it('Should move the index by 1 characters for Enter ', inject([], () => {
        service['text'] = 'ababcde';
        service['cursorIndex'] = 1;
        service['maxCharByLine'] = 'ababcde'.length;
        const expectedCursorIndex = service['cursorIndex'];
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Enter',
        } as KeyboardEvent);

        expect(service['cursorIndex']).toEqual(expectedCursorIndex);
    }));

    it('Should call drawTextSimple after Enter ', inject([], () => {
        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(service, 'drawTextSimple');

        service['text'] = 'ababcde';
        service['cursorIndex'] = 1;
        service['maxCharByLine'] = 'ababcde'.length;
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Enter',
        } as KeyboardEvent);
        // service.modeEcriture = true;
        service.drawTextSimple(true);

        expect(spy).toHaveBeenCalled();
    }));

    it('Should add endline after pressing Enter ', inject([], () => {
        service['text'] = 'ababcde';
        // tslint:disable-next-line: no-magic-numbers
        service['cursorIndex'] = 3;
        service['maxCharByLine'] = 'ababcde'.length;
        // tslint:disable-next-line: no-magic-numbers
        service['maxLines'] = 3;
        const expectedText = 'aba\nbcde';
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'Enter',
        } as KeyboardEvent);
        // service.modeEcriture = true;
        service.drawTextSimple(true);

        expect(service['text']).toEqual(expectedText);
    }));

    it('Should add char after pressing key ', inject([], () => {
        service['text'] = 'ababcde';
        // tslint:disable-next-line: no-magic-numbers
        service['cursorIndex'] = 3;
        service['maxCharByLine'] = 'ababcde'.length;
        // tslint:disable-next-line: no-magic-numbers
        service['maxLines'] = 3;
        const expectedText = 'abaxbcde';
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'x',
        } as KeyboardEvent);
        // service.modeEcriture = true;
        service.drawTextSimple(true);

        expect(service['text']).toEqual(expectedText);
    }));
    it('Should use font style provided ', inject([], () => {
        service['text'] = 'ababcde';
        // tslint:disable-next-line: no-magic-numbers
        service['cursorIndex'] = 3;
        service['maxCharByLine'] = 'ababcde'.length;

        const isItalic = true;
        const isBold = true;
        const fontSize = 12;
        const fontStyle = 'Times New Roman';
        const TWOHUNDRED = 200;
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'x',
        } as KeyboardEvent);
        // service.modeEcriture = true;
        service.drawText(
            false,
            isItalic,
            isBold,
            service['text'],
            'center',
            service['maxCharByLine'],
            fontSize,
            fontStyle,
            TWOHUNDRED,
            TWOHUNDRED,
            { x: 0, y: 0 },
            'rgba(0,0,0,1)',
        );

        const value = service.drawingService.baseCtx.font;
        const expected = 'italic bold ' + fontSize + 'px "' + fontStyle + '"';

        expect(value).toEqual(expected);
    }));
    // 2 eme test pour drawText a faire
    it('Should use font style provided ', inject([], () => {
        service['text'] = 'ababcde';
        // tslint:disable-next-line: no-magic-numbers
        service['cursorIndex'] = 3;
        service['maxCharByLine'] = 'ababcde'.length;

        const isItalic = true;
        const isBold = true;
        const fontSize = 12;
        const fontStyle = 'Times New Roman';
        const TWOHUNDRED = 200;
        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'x',
        } as KeyboardEvent);
        // service.modeEcriture = true;
        service.drawText(
            false,
            isItalic,
            isBold,
            service['text'],
            service.textAlign[1],
            service['maxCharByLine'],
            fontSize,
            fontStyle,
            TWOHUNDRED,
            TWOHUNDRED,
            { x: 0, y: 0 },
            'rgba(0,0,0,1)',
        );

        const value = service.drawingService.baseCtx.font;
        const expected = 'italic bold ' + fontSize + 'px "' + fontStyle + '"';

        expect(value).toEqual(expected);
    }));
    // test pour draw cursor
    it('Should draw cursor center ', inject([], () => {
        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(service.drawingService.previewCtx, 'moveTo');
        service['text'] = '';
        service['cursorIndex'] = 0;
        service['maxCharByLine'] = ''.length;

        const fontSize = 12;

        service.textAlign = service.textAlign[2];

        const width = 200;
        const height = 200;

        service['width'] = width;
        service['height'] = height;
        service.fontSize = fontSize;

        service.onKeyDown({
            keyCode: keyCodes.Number0,
            key: 'x',
        } as KeyboardEvent);
        service['modeEcriture'] = true;

        expect(spy).toHaveBeenCalledWith(0, 0);
    }));

    it('Check if clearpath cleared the path ', inject([], () => {
        service.clearPath();
        const expectedPathData = service['pathData'].length;
        expect(expectedPathData).toEqual(0);
    }));
    // mouse events

    it('onMouseUp should call drawRectangle when entering condition', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['drawingService'].mouseOnCanvas = true;
        service.mouseDown = true;
        // tslint:disable-next-line: no-magic-numbers
        service['height'] = 20;
        // tslint:disable-next-line: no-magic-numbers
        service['width'] = 20;
        const expectedPathData = service['pathData'];
        expectedPathData.push(expectedResult);
        const drawRectangle = spyOn(service, 'drawRectangle');
        service.onMouseUp(mouseEvent);
        expect(drawRectangle).toHaveBeenCalled();
    });
    it('onMouseUp should change initial point if last path data value is lesser than first path data value', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['drawingService'].mouseOnCanvas = true;
        service.mouseDown = true;
        // tslint:disable-next-line: no-magic-numbers
        service['height'] = 20;
        // tslint:disable-next-line: no-magic-numbers
        service['width'] = 20;
        const expectedPathData = service['pathData'];
        expectedPathData.push(expectedResult);
        const pointY = service['initialPoint'].y;
        const initialY = 0;
        service.onMouseUp(mouseEvent);
        expect(pointY).toEqual(initialY);
    });
    it('onMouseMove should call drawRectangle', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['drawingService'].mouseOnCanvas = true;
        service.mouseDown = true;
        const expectedPathData = service['pathData'];
        expectedPathData.push(expectedResult);
        const drawRectangle = spyOn(service, 'drawRectangle');
        service.onMouseMove(mouseEvent);
        expect(drawRectangle).toHaveBeenCalled();
    });

    it('onMouseDown should call drawRectangle', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service['drawingService'].mouseOnCanvas = true;
        service.mouseDown = true;
        const expectedPathData = service['pathData'];
        expectedPathData.push(expectedResult);
        const drawRectangle = spyOn(service, 'drawRectangle');
        service.onMouseDown(mouseEvent);
        expect(drawRectangle).toHaveBeenCalled();
    });

    // tslint:disable-next-line: max-file-line-count
});
