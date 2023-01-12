import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { NewDrawingConfirmationComponent } from '@dialog-new-drawing/new-drawing-confirmation/new-drawing-confirmation.component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Color } from 'src/app/Classes/color';
import { DrawingElement } from 'src/app/Classes/drawing-element';
import { EllipseComponent } from 'src/app/components/tools-component/ellipse/ellipse.component';
import { PencilComponent } from 'src/app/components/tools-component/pencil/pencil.component';
import { RectangleComponent } from 'src/app/components/tools-component/rectangle/rectangle.component';
import { DrawingContinue } from '../../../../../common/communication/DrawingContinue';
import { DrawingSaved } from '../../../../../common/communication/DrawingSaved';
import { DrawingToLoad } from '../../../../../common/communication/DrawingToLoad';
import { ColorService } from '../color-service/color.service';
import { CommandInvokerService } from '../command-invoker/command-invoker.service';
import { ConverterLoadService } from '../converter-service/converterLoad-service';
import { DatabaseDrawingService } from '../database-drawing/database-drawing.service';
import { DrawingStateService } from '../drawing-state/drawing-state.service';
import { DynamicSvgComponentFactoryService } from '../dynamic-svg-component-factory/dynamic-svg-component-factory.service';
import { ServerSavingService } from '../server-saving/server-saving.service';

@Injectable({
  providedIn: 'root'
})
export class NewDrawingService {
  private readonly DRAWING_URL: string = '/drawing';
  readonly BASE_WIDTH: number = 500;
  readonly BASE_HEIGHT: number = 500;

  private typeComponentCreatedMap: Map<string, Type<DrawingElement>>;
  private confirmationDialogRef: MatDialogRef<NewDrawingConfirmationComponent>;

  drawingSize: BehaviorSubject<[number, number]>;
  drawingSizeObservable: Observable<[number, number]>;
  finishedLoading: Subject<void>;
  drawingFinishedLoading: Observable<void>;

  constructor(
    private drawingState: DrawingStateService,
    private router: Router,
    private dynamicFactory: DynamicSvgComponentFactoryService,
    private commandInvoker: CommandInvokerService,
    private colorService: ColorService,
    private currentDrawing: DatabaseDrawingService,
    private confirmationDialog: MatDialog,
    private server: ServerSavingService,
    private converter: ConverterLoadService,
  ) {
    this.finishedLoading = new Subject();
    this.drawingFinishedLoading = this.finishedLoading.asObservable();
    this.drawingSize = new BehaviorSubject<[number, number]>([this.BASE_WIDTH, this.BASE_HEIGHT]);
    this.drawingSizeObservable = this.drawingSize.asObservable();
    this.typeComponentCreatedMap = new Map<string, Type<DrawingElement>>();
    this.setTypeMap();
  }

  loadDrawing(id: string): void {
    if (this.router.url !== this.DRAWING_URL) {
      this.router.navigate([this.DRAWING_URL]).then((navigated) => {
        if (navigated) {
          localStorage.clear();
          this.load(id);
          this.closeDialog();
        }
      });
    } else {
      if (this.existingDrawing()) {
        this.verifyUserConfirmation(id);
      } else {
        this.load(id);
        this.closeDialog();
      }
    }
  }

  loadDrawingInCache(drawingCurrent: DrawingContinue): void {
    if (this.router.url !== this.DRAWING_URL) {
      this.router.navigate([this.DRAWING_URL]).then((navigated) => {
        if (navigated) {
          this.loadContinue(drawingCurrent);
          this.closeDialog();
        }
      });
    } else {
      this.loadContinue(drawingCurrent);
      this.closeDialog();
    }
  }

  createDefaultDrawing(width: number, height: number): void {
    if (this.router.url !== this.DRAWING_URL) {
      this.router.navigate([this.DRAWING_URL]).then((navigated) => {
        if (navigated) {
          this.createDefault(width, height);
        }
      });
    } else {
      if (this.existingDrawing()) {
        this.verifyUserConfirmationDefault(width, height);
      } else {
        this.createDefault(width, height);
      }
    }
  }

  updateDrawingDimensions(width: number, height: number): void {
    this.drawingSize.next([width, height]);
  }

  private closeDialog(): void {
    this.confirmationDialog.closeAll();
  }

  private load(id: string): void {
    this.drawingState.setBusy();
    this.server.getDrawing(id)
      .then((drawing: DrawingToLoad) => {
        if (drawing) {
          this.commandInvoker.resetDoneAndUndoneCommands();
          this.currentDrawing.clearDraw();
          this.currentDrawing.setId(id);
          this.currentDrawing.setName(drawing.name);
          this.currentDrawing.setTags(drawing.tag);
          if (drawing.size && drawing.size.length >= 2) {
            this.updateDrawingDimensions(drawing.size[0], drawing.size[1]);
          }
          if (drawing.color) {
            const backgroundColor = new Color(drawing.color.red, drawing.color.green, drawing.color.blue, drawing.color.opacityPercent);
            this.colorService.backgroundColor = backgroundColor;
          } else {
            this.colorService.backgroundColor = Color.cloneColor(Color.WHITE);
          }
          drawing.elements.forEach((element) => {
            const mapResult = this.typeComponentCreatedMap.get(element.type);
            if (mapResult) {
              const created = this.dynamicFactory.createComponent(mapResult);
              created.instance.initOnLoad(element);
              created.changeDetectorRef.detectChanges();
            }
          });
          this.closeDialog();
          this.drawingState.setAvailable();
          this.finishedLoading.next();
        } else {
          window.alert('Le dessin est corrumpu!');
        }
      })
      .catch((error: HttpErrorResponse) => {
        this.finishedLoading.next();
        window.alert(`Impossible de recevoir le dessin avec l'id : ${id}, ${error.status},
          Le dessin n'est pas dans la base de données. Veuillez en choisir un autre.`);
      });
  }

  private loadContinue(drawingContinue: DrawingContinue): void {
    this.drawingState.setBusy();
    this.dynamicFactory.clearViewContainer();
    const toLoad: DrawingSaved = {
      name: '',
      tag: [],
      _id: '',
      color: drawingContinue.color,
      size: drawingContinue.size,
      preview: drawingContinue.preview
    };
    const toLoadValue = this.converter.drawingSavedToDrawingToLoad(toLoad);
    if (toLoadValue) {
      this.commandInvoker.resetDoneAndUndoneCommands();
      this.currentDrawing.clearDraw();
      if (toLoadValue.size && toLoadValue.size.length >= 2) {
        this.updateDrawingDimensions(toLoadValue.size[0], toLoadValue.size[1]);
      }
      if (toLoadValue.color) {
        const backgroundColor = new Color(
          toLoadValue.color.red,
          toLoadValue.color.green,
          toLoadValue.color.blue,
          toLoadValue.color.opacityPercent);
        this.colorService.backgroundColor = backgroundColor;
      } else {
        this.colorService.backgroundColor = Color.cloneColor(Color.WHITE);
      }
      toLoadValue.elements.forEach((element) => {
        const mapResult = this.typeComponentCreatedMap.get(element.type);
        if (mapResult) {
          const created = this.dynamicFactory.createComponent(mapResult);
          created.instance.initOnLoad(element);
          created.changeDetectorRef.detectChanges();
        }
      });
    }
    this.closeDialog();
    this.drawingState.setAvailable();
    this.finishedLoading.next();
  }

  private createDefault(width: number, height: number): void {
    this.drawingState.setBusy();
    this.currentDrawing.clearDraw();
    this.commandInvoker.resetDoneAndUndoneCommands();
    this.updateDrawingDimensions(width, height);
    this.colorService.confirmBackgroundColor();
    this.drawingState.setAvailable();
    this.finishedLoading.next();
  }

  private verifyUserConfirmation(id: string): void {
    this.confirmationDialogRef = this.confirmationDialog.open(NewDrawingConfirmationComponent);
    this.confirmationDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.dynamicFactory.clearViewContainer();
        this.load(id);
      }
    });
  }

  private verifyUserConfirmationDefault(width: number, height: number): void {
    this.confirmationDialogRef = this.confirmationDialog.open(NewDrawingConfirmationComponent);
    this.confirmationDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.dynamicFactory.clearViewContainer();
        this.createDefault(width, height);
      }
    });
  }

  private setTypeMap(): void {
    this.typeComponentCreatedMap.set('pencil', PencilComponent)
      .set('rectangle', RectangleComponent)
      .set('ellipse', EllipseComponent)
  }

  private existingDrawing(): boolean {
    if (this.dynamicFactory.viewContainerRef) {
      return this.dynamicFactory.viewContainerRef.length > 0;
    }
    return false;
  }
}
