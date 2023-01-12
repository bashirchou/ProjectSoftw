import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatIconModule, MatListModule, MatRippleModule, MatSidenavModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NewDrawingConfirmationComponent } from '@dialog-new-drawing/new-drawing-confirmation/new-drawing-confirmation.component';
import { DummyRectangleComponent } from './Classes/mock-classes/dummy-rectangle.component';
import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './components/app/approuting.module';
import { AttributsComponent } from './components/attributs/attributs.component';
import { EllipseAttributesComponent } from './components/attributs/ellipse-attributes/ellipse-attributes/ellipse-attributes.component';
import { PencilAttributesComponent } from './components/attributs/pencil-attributes/pencil-attributes.component';
import { RectangleAttributesComponent } from './components/attributs/rectangle-attributes/rectangle-attributes.component';
import { SelectionAttributesComponent } from './components/attributs/selection-attributes/selection-attributes/selection-attributes.component';
import { DialogExportComponent } from './components/dialog-export/dialog-export.component';
import { DialogNewDrawingComponent } from './components/drawing/dialog-new-drawing/dialog-new-drawing.component';
import { DialogSavingComponent } from './components/drawing/dialog-saving/dialog-saving/dialog-saving.component';
import { DrawingCanvasComponent } from './components/drawing/drawing-canvas/drawing-canvas.component';
import { LoginPageComponent } from './components/menu/login/login-page/login-page.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { SelectedComponent } from './components/drawing/selected/selected.component';
import { ExportConfirmationComponent } from './components/export-confirmation/export-confirmation.component';
import { ExportMailComponent } from './components/export-mail/export-mail.component';
import { DialogGalleryComponent } from './components/menu/gallery/dialog-gallery.component';
import { DialogGuideComponent } from './components/menu/guide/dialog-guide/dialog-guide.component';
import { GuideContainerComponent } from './components/menu/guide/guide-container/guide-container.component';
import { SubjectAerosolComponent } from './components/menu/guide/guide-subjects/subject-aerosol/subject-aerosol.component';
import { SubjectAutomaticSaveComponent } from './components/menu/guide/guide-subjects/subject-automatic-save/subject-automatic-save.component';
import { SubjectBrushComponent } from './components/menu/guide/guide-subjects/subject-brush/subject-brush.component';
import { SubjectBucketComponent } from './components/menu/guide/guide-subjects/subject-bucket/subject-bucket.component';
import { SubjectColorChangerComponent } from './components/menu/guide/guide-subjects/subject-color-changer/subject-color-changer.component';
import { SubjectColorComponent } from './components/menu/guide/guide-subjects/subject-color/subject-color.component';
import { SubjectContinueDrawingComponent } from './components/menu/guide/guide-subjects/subject-continue-drawing/subject-continue-drawing.component';
import { SubjectEllipseComponent } from './components/menu/guide/guide-subjects/subject-ellipse/subject-ellipse.component';
import { SubjectEraserComponent } from './components/menu/guide/guide-subjects/subject-eraser/subject-eraser.component';
import { SubjectExportComponent } from './components/menu/guide/guide-subjects/subject-export/subject-export.component';
import { SubjectEyedropperComponent } from './components/menu/guide/guide-subjects/subject-eyedropper/subject-eyedropper.component';
import { SubjectGalleryComponent } from './components/menu/guide/guide-subjects/subject-gallery/subject-gallery.component';
import { SubjectGridComponent } from './components/menu/guide/guide-subjects/subject-grid/subject-grid.component';
import { SubjectLineComponent } from './components/menu/guide/guide-subjects/subject-line/subject-line.component';
import { SubjectNewDrawingComponent } from './components/menu/guide/guide-subjects/subject-new-drawing/subject-new-drawing.component';
import { SubjectPencilComponent } from './components/menu/guide/guide-subjects/subject-pencil/subject-pencil.component';
import { SubjectPlaceholderComponent } from './components/menu/guide/guide-subjects/subject-placeholder/subject-placeholder.component';
import { SubjectPolygoneComponent } from './components/menu/guide/guide-subjects/subject-polygone/subject-polygone.component';
import { SubjectRectangleComponent } from './components/menu/guide/guide-subjects/subject-rectangle/subject-rectangle.component';
import { SubjectSavingComponent } from './components/menu/guide/guide-subjects/subject-saving/subject-saving/subject-saving.component';
import { SubjectSelectionComponent } from './components/menu/guide/guide-subjects/subject-selection/subject-selection.component';
import { SubjectTextComponent } from './components/menu/guide/guide-subjects/subject-text/subject-text.component';
import { SubjectWelcomeComponent } from './components/menu/guide/guide-subjects/subject-welcome/subject-welcome.component';
import { NavigationMenuComponent } from './components/menu/navigation-menu.component';
import { ColorPaletteComponent } from './components/tools-component/color/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/tools-component/color/color-picker/color-picker.component';
import { RainbowComponent } from './components/tools-component/color/color-picker/rainbow/rainbow.component';
import { ColorButtonComponent } from './components/tools-component/color/color-tool/color-button/color-button.component';
import { ColorToolComponent } from './components/tools-component/color/color-tool/color-tool.component';
import { EllipseComponent } from './components/tools-component/ellipse/ellipse.component';
import { PencilComponent } from './components/tools-component/pencil/pencil.component';
import { RectangleComponent } from './components/tools-component/rectangle/rectangle.component';
import { SelectionComponent } from './components/tools-component/selection/selection.component';
import { ToolboxComponent } from './components/tools-component/toolbox/toolbox.component';
import { ViewComponent } from './components/view/view.component';
import { DrawingHostDirective } from './directives/drawing-host/drawing-host.directive';
import { GuideHostDirective } from './directives/guide-host/guide-host.directive';
import { HexValueDirective } from './directives/hex-value/hex-value.directive';
import { PointedToolsDirectiveDirective } from './directives/pointed-tools/pointed-tools-directive.directive';
import { ShortcutDisablerDirective } from './directives/shortcut-disabler-host/shortcut-disabler.directive';
import { ProfileComponent } from './components/menu/profile/profile.component';
import { ChatComponent } from './components/chat/chat.component';
import { CreateAccountComponent } from './components/menu/create-account/create-account.component';
import { MatSelectModule } from '@angular/material';

@NgModule({
    declarations: [
        AppComponent,
        NavigationMenuComponent,
        ViewComponent,
        EllipseComponent,
        EllipseAttributesComponent,
        ToolboxComponent,
        AttributsComponent,
        DrawingComponent,
        PencilAttributesComponent,
        SubjectWelcomeComponent,
        DialogGuideComponent,
        DialogGalleryComponent,
        ColorPickerComponent,
        RainbowComponent,
        AttributsComponent,
        PencilComponent,
        DrawingHostDirective,
        ColorPaletteComponent,
        ColorToolComponent,
        DialogSavingComponent,
        RectangleComponent,
        RectangleAttributesComponent,
        ColorButtonComponent,
        GuideContainerComponent,
        SubjectWelcomeComponent,
        SubjectPencilComponent,
        SubjectBrushComponent,
        SubjectLineComponent,
        SubjectRectangleComponent,
        SubjectNewDrawingComponent,
        SubjectSavingComponent,
        SubjectPlaceholderComponent,
        LoginPageComponent,
        HexValueDirective,
        DialogNewDrawingComponent,
        GuideHostDirective,
        NewDrawingConfirmationComponent,
        ShortcutDisablerDirective,
        SubjectColorComponent,
        DrawingCanvasComponent,
        DialogExportComponent,
        DialogSavingComponent,
        DrawingCanvasComponent,
        PointedToolsDirectiveDirective,
        SelectionComponent,
        SelectedComponent,
        ExportConfirmationComponent,
        SubjectSelectionComponent,
        SubjectEllipseComponent,
        DummyRectangleComponent,
        SubjectEyedropperComponent,
        SubjectPolygoneComponent,
        SubjectColorChangerComponent,
        SubjectSavingComponent,
        SubjectExportComponent,
        SubjectAerosolComponent,
        SubjectEraserComponent,
        SubjectGridComponent,
        SubjectGalleryComponent,
        ExportMailComponent,
        SelectionAttributesComponent,
        SubjectTextComponent,
        SubjectBucketComponent,
        SubjectAutomaticSaveComponent,
        SubjectContinueDrawingComponent,
        ProfileComponent,
        ChatComponent,
        CreateAccountComponent,
    ],
    entryComponents: [
        DialogGuideComponent,
        DialogGalleryComponent,
        PencilComponent,
        EllipseComponent,
        RectangleComponent,
        SubjectWelcomeComponent,
        SubjectPencilComponent,
        SubjectBrushComponent,
        SubjectRectangleComponent,
        SubjectEllipseComponent,
        SubjectLineComponent,
        SubjectSelectionComponent,
        SubjectNewDrawingComponent,
        SubjectSavingComponent,
        SubjectPlaceholderComponent,
        DialogNewDrawingComponent,
        DialogSavingComponent,
        SubjectWelcomeComponent,
        NewDrawingConfirmationComponent,
        SubjectColorComponent,
        DialogExportComponent,
        SelectionComponent,
        ExportConfirmationComponent,
        SubjectEyedropperComponent,
        SubjectPolygoneComponent,
        SubjectColorChangerComponent,
        SubjectExportComponent,
        SubjectAerosolComponent,
        SubjectEraserComponent,
        SubjectGridComponent,
        SubjectGalleryComponent,
        ExportMailComponent,
        SubjectTextComponent,
        SubjectBucketComponent,
        SubjectAutomaticSaveComponent,
        SubjectContinueDrawingComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatListModule,
        MatSidenavModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatRippleModule,
        MatDialogModule,
        NoopAnimationsModule,
        AppRoutingModule,
        MatCheckboxModule,
        MatSelectModule,
    ],
    bootstrap: [
        AppComponent,
    ]
})
export class AppModule { }
