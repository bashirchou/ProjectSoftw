import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColorPickerComponent } from './components/color/color-picker/color-picker.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'editor', component: EditorComponent },
    { path: 'color', component: ColorPickerComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
