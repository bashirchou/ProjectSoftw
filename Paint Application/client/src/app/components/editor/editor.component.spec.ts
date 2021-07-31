import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { KeyValuePipe, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Injector, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DialogDataSaveServer } from '@app/classes/constant';
import { Tag } from '@app/classes/tag';
import { AttributePaneComponent } from '@app/components/attribute-pane/attribute-pane.component';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { DisplayImagesComponent } from '@app/components/display-images/display-images.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { ExportImageComponent } from '@app/components/export-image/export-image.component';
import { SaveServerPopupComponent } from '@app/components/save-server-popup/save-server-popup.component';
import { SidebarItemComponent } from '@app/components/sidebar-item/sidebar-item.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ConfirmDialogService } from '@app/services/drawing/confirm-dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyHandlerService } from '@app/services/tools/key-handler.service';
import { Observable, Subject } from 'rxjs';
import { EditorComponent } from './editor.component';

class KeyHandlerServiceMock {
    isShortcutActive: boolean = false;
    subjectSaveDraw: Subject<string> = new Subject<string>();
    subjectNewDraw: Subject<string> = new Subject<string>();

    getObservableFromShortcut(shortcut: string): Observable<string> {
        if (shortcut === 'control s') return this.subjectSaveDraw.asObservable();
        else return this.subjectNewDraw.asObservable();
    }
}
// tslint:disable: no-string-literal
// tslint:disable: no-empty
// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: 'mat-icon',
    template: '<span></span>',
})
class MockMatIconComponent {
    // tslint:disable-next-line: no-any
    @Input() svgIcon: any;
    // tslint:disable-next-line: no-any
    @Input() fontSet: any;
    // tslint:disable-next-line: no-any
    @Input() fontIcon: any;
}

// tslint:disable-next-line: max-classes-per-file
class DrawingServiceMock {
    canvas: HTMLCanvasElement = new CanvasTestHelper().canvas;
    baseCtx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    primaryColor: string = 'rgba(0,0,0,1)';
    drawControlPoints(): void {
        return;
    }
    isCanvasEmpty(): boolean {
        return true;
    }
    clearCanvas(): void {
        return;
    }
    isPointsOnCanvas(x: number, y: number): boolean {
        return true;
    }
    convertBase64ToCanvas(base64: string): void {
        return;
    }
}
describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    const keyHandlerServiceMock: KeyHandlerServiceMock = new KeyHandlerServiceMock();
    let drawingServiceMock: DrawingServiceMock;
    beforeEach(
        waitForAsync(() => {
            drawingServiceMock = new DrawingServiceMock();
            TestBed.configureTestingModule({
                imports: [
                    MatMenuModule,
                    MatInputModule,
                    BrowserAnimationsModule,
                    MatTooltipModule,
                    MatIconModule,
                    MatDialogModule,
                    HttpClientModule,
                    MatIconModule,
                    MatCheckboxModule,
                    MatSliderModule,
                    MatCheckboxModule,
                    MatInputModule,
                    MatCheckboxModule,
                    FormsModule,
                    RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }]),
                ],
                declarations: [
                    EditorComponent,
                    DrawingComponent,
                    SidebarComponent,
                    AttributePaneComponent,
                    ColorPickerComponent,
                    SidebarItemComponent,
                    KeyValuePipe,
                ],
                providers: [
                    { provide: SaveServerPopupComponent, useValue: {} },
                    { provide: DrawingService, useValue: drawingServiceMock },
                    { provide: KeyHandlerService, useValue: keyHandlerServiceMock },
                    { provide: MatDialogRef, useValue: {} },

                    {
                        provide: ConfirmDialogService,
                        useValue: new ConfirmDialogService(
                            new MatDialog(
                                // tslint:disable-next-line: no-empty
                                { position(): void {} } as Overlay,
                                {} as Injector,
                                {} as Location,
                                {},
                                {},
                                {} as MatDialog,
                                {} as OverlayContainer,
                            ),
                            {} as MatDialogRef<ConfirmDialogComponent>,
                        ),
                    },
                ],
            })
                .overrideModule(MatIconModule, {
                    remove: {
                        declarations: [MatIcon],
                        exports: [MatIcon],
                    },
                    add: {
                        declarations: [MockMatIconComponent],
                        exports: [MockMatIconComponent],
                    },
                })
                .compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    afterAll(() => {
        component.dialog.closeAll();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should open the new Draw dialog', () => {
        const spy = spyOn(component, 'openNewDrawDialog').and.callFake(() => {});
        component.newDrawShortcut();
        expect(spy).toHaveBeenCalled();
    });
    it('Should open the save draw dialog', () => {
        const spy = spyOn(component, 'openSaveDrawDialog').and.callFake(() => {});
        component.saveDrawShorcut();
        expect(spy).toHaveBeenCalled();
    });

    it('Should open the export draw dialog', () => {
        const spy = spyOn(component, 'openExportImageDialog').and.callFake(() => {});
        component.exportDrawShortcut();
        expect(spy).toHaveBeenCalled();
    });

    it('Should open the Carrousel dialog', () => {
        const spy = spyOn(component, 'openDialogCarousel').and.callFake(() => {});
        component.newCarouselShorcut();
        expect(spy).toHaveBeenCalled();
    });

    it('Should call open and confirmed when opening the new Draw dialog', () => {
        const openSpy = spyOn(component['dialogService'], 'open').and.callFake(() => {
            return;
        });
        const openComfirm = spyOn(component['dialogService'], 'confirmed').and.callFake(() => {
            return new Observable<boolean>();
        });
        component.openNewDrawDialog();
        expect(openSpy).toHaveBeenCalled();
        expect(openComfirm).toHaveBeenCalled();
    });

    it('Should call open when opening the save Draw dialog', () => {
        const ob1 = new Subject<void>();
        // tslint:disable-next-line: no-any
        const ob2 = new Subject<any>();
        const mockDialogRef = {
            afterOpened: () => {
                return ob1.asObservable();
            },
            afterClosed: () => {
                // tslint:disable-next-line: no-any
                return ob2.asObservable();
            },
        };

        const openSpy = spyOn(component.dialog, 'open').and.callFake(() => {
            // tslint:disable-next-line: no-any
            return mockDialogRef as MatDialogRef<SaveServerPopupComponent, MatDialogConfig<any>>;
        });
        component.openSaveDrawDialog();
        expect(openSpy).toHaveBeenCalled();
        ob1.complete();
        ob2.complete();
    });

    it('After the save draw dialog is open, there should be not shortcut available', () => {
        component['keyHandlerService'].isShortcutActive = true;
        component.afterOpenedSaveDialog();
        expect(component['keyHandlerService'].isShortcutActive).toBeFalse();
    });

    it('After the save draw dialog is close, there should be shortcut available and data reset if the user save', () => {
        component['tagsSave'] = [new Tag('test')];
        component['nameSave'] = 'test';
        component['keyHandlerService'].isShortcutActive = true;
        component.afterClosedSaveDialog({} as DialogDataSaveServer);
        expect(component['keyHandlerService'].isShortcutActive).toBeTrue();
        expect(component['tagsSave'].length).toBe(0);
        expect(component['nameSave']).toBe('');
    });

    it('After the save draw dialog is close, there should be shortcut available and data not reset if the user quit', () => {
        component['tagsSave'] = [new Tag('test')];
        component['nameSave'] = 'test';
        component['keyHandlerService'].isShortcutActive = false;
        component.afterClosedSaveDialog(undefined);
        expect(component['keyHandlerService'].isShortcutActive).toBeTrue();
        expect(component['tagsSave'].length).toBe(1);
        expect(component['nameSave']).toBe('test');
    });

    it('Should clear the canvas if the user confirm it', () => {
        const clearCanvasSpy = spyOn(component['toolsControllerService'].drawingService, 'clearCanvas').and.callThrough();
        component.newDraw(true);
        expect(clearCanvasSpy).toHaveBeenCalled();
        expect(clearCanvasSpy).toHaveBeenCalledWith(component['toolsControllerService'].drawingService.baseCtx);
    });

    it('Should not clear the canvas if the user cancel', () => {
        const clearCanvasSpy = spyOn(component['toolsControllerService'].drawingService, 'clearCanvas').and.callThrough();
        component.newDraw(false);
        expect(clearCanvasSpy).not.toHaveBeenCalled();
    });

    it('Should open the carouel if the canvas is empty', () => {
        const spy = spyOn(component, 'openCarousel').and.callFake(() => {});
        spyOn(component['drawingService'], 'isCanvasEmpty').and.returnValue(true);
        component.openDialogCarousel();
        expect(spy).toHaveBeenCalled();
    });

    it('Should ask for the user if the canvas is not empty and call the newCarousel function', () => {
        spyOn(component['drawingService'], 'isCanvasEmpty').and.returnValue(false);

        const openSpy = spyOn(component['dialogCarouselService'], 'open').and.callFake(() => {
            return;
        });
        const openNewCarousel = spyOn(component, 'newCarousel').and.callFake(() => {
            return;
        });
        const subject = new Subject<boolean>();
        const openComfirm = spyOn(component['dialogCarouselService'], 'confirmed').and.callFake(() => {
            return subject.asObservable();
        });
        component.openDialogCarousel();
        subject.next(true);
        expect(openSpy).toHaveBeenCalled();
        expect(openComfirm).toHaveBeenCalled();
        expect(openNewCarousel).toHaveBeenCalledWith(true);
    });

    it('Should open the carrousel', () => {
        const ob1 = new Subject<void>();
        // tslint:disable-next-line: no-any
        const ob2 = new Subject<any>();
        const mockDialogRef = {
            afterOpened: () => {
                return ob1.asObservable();
            },
            afterClosed: () => {
                // tslint:disable-next-line: no-any
                return ob2.asObservable();
            },
        };

        const openSpy = spyOn(component.dialog, 'open').and.callFake(() => {
            // tslint:disable-next-line: no-any
            return mockDialogRef as MatDialogRef<DisplayImagesComponent, MatDialogConfig<any>>;
        });

        component.openCarousel();
        expect(openSpy).toHaveBeenCalled();

        ob1.next();
        expect(component['keyHandlerService'].isShortcutActive).toBeFalse();
        ob1.complete();

        ob2.next([]);
        expect(component['keyHandlerService'].isShortcutActive).toBeTrue();
        ob2.next(undefined);
        expect(component['tagsCarou']).toEqual([]);
        ob2.complete();
    });

    it('Should open openExportImageDialog', () => {
        const ob1 = new Subject<void>();
        // tslint:disable-next-line: no-any
        const ob2 = new Subject<any>();
        const mockDialogRef = {
            afterOpened: () => {
                return ob1.asObservable();
            },
            afterClosed: () => {
                // tslint:disable-next-line: no-any
                return ob2.asObservable();
            },
        };

        const openSpy = spyOn(component.dialog, 'open').and.callFake(() => {
            // tslint:disable-next-line: no-any
            return mockDialogRef as MatDialogRef<ExportImageComponent, MatDialogConfig<any>>;
        });

        component.openExportImageDialog();
        expect(openSpy).toHaveBeenCalled();
        ob1.next();
        expect(component['keyHandlerService'].isShortcutActive).toBeFalse();
        ob2.next([]);
        expect(component['keyHandlerService'].isShortcutActive).toBeTrue();
        expect(component['tagsSave']).toEqual([]);
        expect(component['nameSave']).toBe('');
        ob1.complete();
        ob2.complete();
    });

    it('Should open a newCarousel only if parameter is true', () => {
        const spyNewDraw = spyOn(component, 'newDraw').and.callFake(() => {
            return;
        });
        const spyOpenCarousel = spyOn(component, 'openCarousel').and.callFake(() => {
            return;
        });
        const confirm = true;
        component.newCarousel(confirm);
        expect(spyNewDraw).toHaveBeenCalledWith(confirm);
        expect(spyOpenCarousel).toHaveBeenCalled();
    });

    it('Should open a newCarousel only if parameter is false', () => {
        const spyNewDraw = spyOn(component, 'newDraw').and.callFake(() => {
            return;
        });
        const spyOpenCarousel = spyOn(component, 'openCarousel').and.callFake(() => {
            return;
        });
        const confirm = false;
        component.newCarousel(confirm);
        expect(spyNewDraw).not.toHaveBeenCalledWith(confirm);
        expect(spyOpenCarousel).not.toHaveBeenCalled();
    });

    it('Should call undo when undo is click', () => {
        const spy = spyOn(component['undoRedoService'], 'undo').and.callFake(() => {
            return;
        });
        component.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('Should call redo when undo is click', () => {
        const spy = spyOn(component['undoRedoService'], 'redo').and.callFake(() => {
            return;
        });
        component.redo();
        expect(spy).toHaveBeenCalled();
    });
    // tslint:disable-next-line: max-file-line-count
});
