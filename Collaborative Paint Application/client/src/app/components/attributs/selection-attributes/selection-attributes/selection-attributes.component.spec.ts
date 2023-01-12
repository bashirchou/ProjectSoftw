import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClipboardService } from 'src/app/services/clipboard/clipboard.service';
import { SelectionService } from 'src/app/services/tool-services/selection/selection.service';
import { SelectionAttributesComponent } from './selection-attributes.component';

describe('SelectionAttributesComponent', () => {
  let component: SelectionAttributesComponent;
  let fixture: ComponentFixture<SelectionAttributesComponent>;
  let clipboard: ClipboardService;
  let selection: SelectionService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectionAttributesComponent],
      providers: [
        {
          provide: ClipboardService,
          useValue: jasmine.createSpyObj<ClipboardService>(
            ['copy', 'cut', 'delete', 'paste', 'duplicate', 'clipboardIsEmpty']
          )
        },
        {
          provide: SelectionService,
          useValue: jasmine.createSpyObj<SelectionService>(
            ['invertSelection', 'selectAll', 'selectionIsEmpty']
          )
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    clipboard = TestBed.get(ClipboardService);
    selection = TestBed.get(SelectionService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clipboard functions to be called correctly', () => {
    component.clipboardIsEmpty();

    expect(clipboard.delete).toHaveBeenCalled();
 
    expect(clipboard.clipboardIsEmpty).toHaveBeenCalled();
  });

  it('selectionService functions should be called correctly', () => {
    component.selectionIsEmpty();
    expect(selection.selectAll).toHaveBeenCalled();
    expect(selection.invertSelection).toHaveBeenCalled();
    expect(selection.selectionIsEmpty).toHaveBeenCalled();
  });
});
