import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributePaneComponent } from './components/attribute-pane/attribute-pane.component';
import { ColorPickerComponent } from './components/color/color-picker/color-picker.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DelayDialogComponent } from './components/delay-dialog/delay-dialog.component';
import { DisplayImagesComponent } from './components/display-images/display-images.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportImageComponent } from './components/export-image/export-image.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MessageDisplayerComponent } from './components/message-displayer/message-displayer.component';
import { SaveServerPopupComponent } from './components/save-server-popup/save-server-popup.component';
import { SidebarItemComponent } from './components/sidebar-item/sidebar-item.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MaterialModule } from './material.module';
import { ConfirmDialogCarouselService } from './services/drawing/confirm-carousel-dialog.service';
import { ConfirmDialogService } from './services/drawing/confirm-dialog.service';
import { PencilService } from './services/tools/pencil.service';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        SidebarItemComponent,
        AttributePaneComponent,
        ColorPickerComponent,
        ConfirmDialogComponent,
        SaveServerPopupComponent,
        MessageDisplayerComponent,
        DisplayImagesComponent,
        DelayDialogComponent,
        ExportImageComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        BrowserAnimationsModule,
    ],
    exports: [ConfirmDialogComponent],
    providers: [
        ConfirmDialogService,
        ConfirmDialogCarouselService,
        PencilService,
        {
            provide: MatDialogRef,
            useValue: {},
        },
    ],
    entryComponents: [ConfirmDialogComponent],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        const url = '../../assets/eraserToolIcon.svg';
        const url2 = '../../assets/spray.svg';
        const url3 = '../../assets/paint-bucket.svg';
        const url4 = '../../assets/text.svg';

        this.matIconRegistry.addSvgIcon('eraserIcon', this.domSanitizer.bypassSecurityTrustResourceUrl(url));
        this.matIconRegistry.addSvgIcon('sprayIcon', this.domSanitizer.bypassSecurityTrustResourceUrl(url2));
        this.matIconRegistry.addSvgIcon('paint-bucket', this.domSanitizer.bypassSecurityTrustResourceUrl(url3));
        this.matIconRegistry.addSvgIcon('textIcon', this.domSanitizer.bypassSecurityTrustResourceUrl(url4));
    }
}
