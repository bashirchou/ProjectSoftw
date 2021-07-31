/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';
import { AerosolService } from './aerosol.service';

describe('Service: Aerosol', () => {
    let service: AerosolService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableTrait']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(AerosolService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should build the service successfully', inject([AerosolService], (s: AerosolService) => {
        expect(s).toBeTruthy();
    }));

    it(`should set the emissionPoint if the given emission value is above or equal to the minimum emission
        and if the given emission value is below or equal to the maximum emission value`, inject([AerosolService], (s: AerosolService) => {
        const mockEmission = 201;
        s.emissionPoint = mockEmission;
        expect(s.emission).not.toEqual(mockEmission);
    }));

    it(`should not call the undoRedoService's AddCommand if the mouseDown boolean
    and the drawingService\'s mouseOnCanvas boolean are set to false`, inject([AerosolService, UndoRedoService], (s: AerosolService) => {
        const spy = spyOn(s['undoredoService'], 'addCommand');
        s.mouseDown = false;
        s['drawingService'].mouseOnCanvas = false;

        s.onMouseDown(mouseEvent);
        s.onMouseUp(mouseEvent);

        expect(spy).not.toHaveBeenCalled();
    }));

    it('it should not create a path if the mouseDown boolean is set to false and the mouseOnCanvas booleans are set to false.', inject(
        [AerosolService, UndoRedoService],
        (s: AerosolService) => {
            const notExpectedPath = { x: mouseEvent.offsetX, y: mouseEvent.offsetY } as Vec2;

            s.mouseDown = false;
            s['drawingService'].mouseOnCanvas = false;

            s.onMouseMove(mouseEvent);

            expect(s['path']).not.toEqual(notExpectedPath);
        },
    ));

    it('should change the baseCtx of drawingService on spray() function call, if the emission value is above 0', inject(
        [AerosolService, UndoRedoService],
        (s: AerosolService) => {
            /* tslint:disable-next-line */
            const angle = [12, 1, 2, 4, 5, 76, 75, 3];
            /* tslint:disable-next-line */
            const radius = [12, 1, 1, 2, 3, 4, 5];
            const path = { x: mouseEvent.offsetX, y: mouseEvent.offsetY } as Vec2;
            const goutteDiameter = 16;
            const rotation = 24;
            const beginAngle = 50;
            const endAngle = 80;
            const color = 'black';

            const beginningCtx = s['drawingService'].baseCtx;
            const beginningImageData = beginningCtx.getImageData(0, 0, beginningCtx.canvas.width, beginningCtx.canvas.height);

            s.spray(s['drawingService'], angle, radius, path, goutteDiameter, rotation, beginAngle, endAngle, color);

            const endCtx = s['drawingService'].baseCtx;
            const endCtxImageData = endCtx.getImageData(1, 0, endCtx.canvas.width, endCtx.canvas.height);

            expect(beginningImageData).not.toEqual(endCtxImageData);
        },
    ));

    it(`should not call spray (or any other methods inside of the
        if-statement if the mouseDown and mouseOnCanvas booleans are set to false`, inject([AerosolService, UndoRedoService], (s: AerosolService) => {
        const spy = spyOn(s, 'spray');

        s.mouseDown = false;
        s['drawingService'].mouseOnCanvas = false;

        s.onMouseDown(mouseEvent);

        expect(spy).not.toHaveBeenCalled();
    }));

    it('should trigger the integrated callback function (which calls the spray function), once the s.timer is resolved', inject(
        [AerosolService, UndoRedoService],
        (s: AerosolService) => {
            const spy = spyOn(s, 'spray');
            jasmine.clock().install();

            const mockTimer = 1000;
            jasmine.clock().tick(0);

            s['time'] = mockTimer;
            s.mouseDown = true;
            s['drawingService'].mouseOnCanvas = true;
            s.onMouseDown(mouseEvent);

            expect(spy).not.toHaveBeenCalled();
            jasmine.clock().tick(mockTimer);
            expect(spy).toHaveBeenCalled();

            jasmine.clock().uninstall();
        },
    ));
});
