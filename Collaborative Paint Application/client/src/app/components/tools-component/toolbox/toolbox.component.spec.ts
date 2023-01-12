import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule, MatDialog, MatDialogModule, MatDividerModule, MatIconModule } from '@angular/material';
import { ToolType } from 'src/app/Classes/enums/tool-type';
import { ClipboardService } from 'src/app/services/clipboard/clipboard.service';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { DialogOpenerService } from 'src/app/services/dialog-opener-service/dialog-opener.service';
import { DrawingStateService } from 'src/app/services/drawing-state/drawing-state.service';
import { GridAttributesService } from 'src/app/services/tool-services/grid/grid-attributes.service';
import { SelectionService } from 'src/app/services/tool-services/selection/selection.service';
import { ToolboxComponent } from './toolbox.component';

describe('ToolboxComponent', () => {

  const createKeyboardEvent = (keyCode: string, ctrlPressed: boolean = false, shiftPressed: boolean = false) => {
    return new KeyboardEvent('keydown', {
      ctrlKey: ctrlPressed,
      shiftKey: shiftPressed,
      code: keyCode,
    });
  };

  const wKeyPress = createKeyboardEvent('KeyW');
  const deletePressed = createKeyboardEvent('Delete');
  const numpadMinusPressed = createKeyboardEvent('NumpadSubtract');
  const controlCKeyPress = createKeyboardEvent('KeyC', true);
  const controlVKeyPress = createKeyboardEvent('KeyV', true);
  const controlXKeyPress = createKeyboardEvent('KeyX', true);
  const controlDKeyPress = createKeyboardEvent('KeyD', true);
  const spacePress = createKeyboardEvent('Space');
  const controlAPressed = createKeyboardEvent('KeyA', true);
  const controlSPressed = createKeyboardEvent('KeyS', true);
  const controlGPressed = createKeyboardEvent('KeyG', true);
  const controlEPressed = createKeyboardEvent('KeyE', true);
  const controlOPressed = createKeyboardEvent('KeyO', true);
  const minusPressed = createKeyboardEvent('Minus');
  const plusPresed = createKeyboardEvent('NumpadAdd');
  const gPressed = createKeyboardEvent('KeyG');
  const TTF = new KeyboardEvent('KeyboardEvent', { ctrlKey: false, shiftKey: false, altKey: true});

  const controlZPressed = new KeyboardEvent('keydown', {
    ctrlKey: true,
    key: 'z',
  });
  const controlShiftZPressed = new KeyboardEvent('keydown', {
    ctrlKey: true,
    shiftKey: true,
    key: 'z',
  });

  let fixture: ComponentFixture<ToolboxComponent>;
  let component: ToolboxComponent;
  let drawingState: DrawingStateService;
  let commandInvoker: CommandInvokerService;
  let dialogOpener: DialogOpenerService;
  let gridService: GridAttributesService;
  let selectionService: SelectionService;
  let clipboard: ClipboardService;
  let sendMessageSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToolboxComponent],
      imports: [MatButtonToggleModule, MatIconModule, MatDialogModule, MatDividerModule],
      providers: [DrawingStateService, MatDialog,
        {
          provide: ClipboardService,
          useValue: jasmine.createSpyObj<ClipboardService>([
            'copy', 'paste', 'cut', 'duplicate', 'delete'
          ])
        },
        {
          provide: SelectionService,
          useValue: jasmine.createSpyObj<SelectionService>([
            'unselectAll', 'selectAll'
          ])
        },
        {
          provide: CommandInvokerService,
          useValue: jasmine.createSpyObj<CommandInvokerService>([
            'undo', 'redo', 'undoIsAvailable', 'redoIsAvailable'
          ])
        },
        {
          provide: DialogOpenerService,
          useValue: jasmine.createSpyObj<DialogOpenerService>([
            'openNewDrawingForm', 'openGallery', 'openSaving', 'openExport'
          ])
        },
        {
          provide: GridAttributesService,
          useValue: jasmine.createSpyObj<GridAttributesService>([
            'increaseGridSize', 'decreaseGridSize', 'toggleGrid'
          ])
        }],
    });
    fixture = TestBed.createComponent(ToolboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    drawingState = TestBed.get(DrawingStateService);
    selectionService = TestBed.get(SelectionService);
    dialogOpener = TestBed.get(DialogOpenerService);
    gridService = TestBed.get(GridAttributesService);
    commandInvoker = TestBed.get(CommandInvokerService);
    clipboard = TestBed.get(ClipboardService);
    drawingState.setAvailable();
    sendMessageSpy = spyOn(component, 'sendMessage').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call', () => {
    component.keyboardEvent(TTF);
    expect(sendMessageSpy).toHaveBeenCalledTimes(0);
  });

  it('should default to the pencil tool on init and set the shortcut bindings', () => {
    component.ngOnInit();
    expect(component.drawingState.selectedTool).toBe(ToolType.pencil);

    component.keyboardEvent(wKeyPress);
    expect(component.drawingState.selectedTool).toBe(ToolType.brush);
    expect(sendMessageSpy).toHaveBeenCalled();
  });

  it('should not update the selected tool if shortcut is not bound', () => {
    component.keyboardEvent(spacePress);
    expect(sendMessageSpy).toHaveBeenCalledTimes(0);
  });

  it('should not update the selected tool using a shortcut when a tool is being used', () => {
    drawingState.setBusy();
    component.keyboardEvent(wKeyPress);
    expect(sendMessageSpy).not.toHaveBeenCalled();
  });

  it('#sendMessage should emit', () => {
    const messageEventSpy: jasmine.Spy = spyOn(component.messageEvent, 'emit').and.callThrough();
    component.sendMessage();
    expect(messageEventSpy).toHaveBeenCalled();
  });

  it('#sendMessage should not emit if a tool is being used', () => {
    const messageEventSpy: jasmine.Spy = spyOn(component.messageEvent, 'emit').and.callThrough();
    drawingState.setBusy();
    component.sendMessage();
    expect(messageEventSpy).not.toHaveBeenCalled();
  });

  it('should open the new drawing component', () => {
    window.dispatchEvent(controlOPressed);
    expect(dialogOpener.openNewDrawingForm).toHaveBeenCalled();
  });

  it('should open export component', () => {
    window.dispatchEvent(controlEPressed);
    expect(dialogOpener.openExport).toHaveBeenCalled();
  });

  it('should open gallery component', () => {
    window.dispatchEvent(controlGPressed);
    expect(dialogOpener.openGallery).toHaveBeenCalled();
  });

  it('should open saving component', () => {
    window.dispatchEvent(controlSPressed);
    expect(dialogOpener.openSaving).toHaveBeenCalled();
  });

  it('pressing control z should undo the last command and unselect all possibly selected elements', () => {
    window.dispatchEvent(controlZPressed);
    expect(commandInvoker.undo).toHaveBeenCalled();
    expect(selectionService.unselectAll).toHaveBeenCalled();
  });

  it('pressing control z should do nothing if a tool is being used', () => {
    drawingState.setBusy();
    window.dispatchEvent(controlZPressed);
    expect(commandInvoker.undo).not.toHaveBeenCalled();
  });

  it('pressing control shift z should redo the last undone command and unselect all possibly selected elements', () => {
    window.dispatchEvent(controlShiftZPressed);
    expect(commandInvoker.redo).toHaveBeenCalled();
    expect(selectionService.unselectAll).toHaveBeenCalled();
  });

  it('pressing control shift z should do nothing if a tool is being used', () => {
    drawingState.setBusy();
    window.dispatchEvent(controlShiftZPressed);
    expect(commandInvoker.redo).not.toHaveBeenCalled();
  });

  it('pressing control a should select all elements', () => {
    drawingState.selectedTool = ToolType.selection;
    window.dispatchEvent(controlAPressed);
    expect(selectionService.selectAll).toHaveBeenCalled();
  });

  it('should increase grid size if grid selected when + pressed', () => {
    window.dispatchEvent(plusPresed);
    expect(gridService.increaseGridSize).toHaveBeenCalled();
  });

  it('should decrease grid size if grid selected when - pressed', () => {
    window.dispatchEvent(minusPressed);
    expect(gridService.decreaseGridSize).toHaveBeenCalled();
    window.dispatchEvent(numpadMinusPressed);
    expect(gridService.decreaseGridSize).toHaveBeenCalledTimes(2);
  });

  it('should toggle the grid on g press', () => {
    window.dispatchEvent(gPressed);
    expect(gridService.toggleGrid).toHaveBeenCalled();
  });


  it('should call delete if delete is pressed', () => {
    window.dispatchEvent(deletePressed);
    expect(clipboard.delete).toHaveBeenCalled();
  });
});
