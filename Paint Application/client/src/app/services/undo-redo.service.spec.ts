import { inject, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from './drawing/drawing.service';
import { PencilService } from './tools/pencil.service';
import { UndoRedoService } from './undo-redo.service';

describe('Service: UndoRedoService', () => {
    let service: UndoRedoService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'enableTrait']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(UndoRedoService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should create the service', inject([], () => {
        expect(service).toBeTruthy();
    }));

    it('should not do anything if the undoHistory has a length of 0', inject([], () => {
        const spy = spyOn(service, 'redrawHistory');

        service.undoHistory = [];
        service.undo();
        expect(spy).not.toHaveBeenCalled();
        expect(service.undoHistory).toEqual([]);
    }));

    it('should not do anything if the redoHistory has a length of 0', inject([], () => {
        const spy = spyOn(service, 'redrawHistory');

        service.redoHistory = [];
        service.redo();
        expect(spy).not.toHaveBeenCalled();
        expect(service.undoHistory).toEqual([]);
    }));

    it('should call command.execute() for all the commands that are in the undoHistory as well as keep the undoHistory and redoHistory stack filled with the respective command calls.', inject(
        [PencilService],
        (pencilService: PencilService) => {
            const mockHistoryCount = 3;
            const mouseEvent = {
                offsetX: 25,
                offsetY: 25,
                button: 0,
            } as MouseEvent;

            const mockWidth = 800;
            const mockHeight = mockWidth;

            for (let i = 0; i < mockHistoryCount; i++) {
                pencilService.mouseDown = true;
                pencilService.disableDraw = false;
                pencilService['drawingService'].mouseOnCanvas = true;
                pencilService.onMouseDown(mouseEvent);
                pencilService.onMouseUp(mouseEvent);
            }

            const baseCtx = service['drawingService'].baseCtx;
            baseCtx.canvas.width = mockWidth;
            baseCtx.canvas.height = mockHeight;
            service['drawingService'].canvas = baseCtx.canvas;

            // tslint:disable-next-line: no-string-literal
            const startingImageData = baseCtx.getImageData(0, 0, mockWidth, mockHeight);

            // Start Testing
            // tslint:disable-next-line: prettiers
            expect(service.undoHistory.length).toEqual(mockHistoryCount);

            service.undo();

            expect(service.undoHistory.length).toEqual(mockHistoryCount - 1);
            expect(service.redoHistory.length).toEqual(1);
            service.redo();

            expect(service.undoHistory.length).toEqual(mockHistoryCount);
            expect(service.redoHistory.length).toEqual(0);

            for (let i = 0; i < mockHistoryCount; i++) {
                service.undo();
            }

            let postUndoImageData = baseCtx.getImageData(0, 0, mockWidth, mockHeight);
            expect(postUndoImageData).toEqual(new ImageData(mockWidth, mockHeight));
            expect(service.undoHistory.length).toEqual(0);
            expect(service.redoHistory.length).toEqual(mockHistoryCount);

            for (let i = 0; i < mockHistoryCount; i++) {
                service.redo();
            }
            postUndoImageData = baseCtx.getImageData(0, 0, mockWidth, mockHeight);
            expect(postUndoImageData).toEqual(startingImageData);
        },
    ));
});
