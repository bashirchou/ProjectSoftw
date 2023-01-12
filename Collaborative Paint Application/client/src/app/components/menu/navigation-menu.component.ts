import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DialogOpenerService } from 'src/app/services/dialog-opener-service/dialog-opener.service';
import { DrawingSavingService } from 'src/app/services/drawing-saving-service/drawing-saving.service';
import { SocketService } from 'src/app/services/socket-service.service';

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.css']
})

export class NavigationMenuComponent {

  @HostListener('window:keydown.control.o', ['$event']) newDrawingShortcut(event: KeyboardEvent): void {
    event.preventDefault();
    this.openForm();
  }

  @HostListener('window:keydown.control.g', ['$event']) loadDrawingShortcut(event: KeyboardEvent): void {
    event.preventDefault();
    this.openGallery();
  }

  constructor(
    private router: Router,
    public dialogForm: MatDialog,
    public dialogOpener: DialogOpenerService,
    public savingService: DrawingSavingService,
    public socketService: SocketService) { }

  drawingInCache(): boolean {
    const exist = this.savingService.retrieveSvgInStorage();
    if (exist) {
      return exist.preview !== '';
    }
    return false;
  }

  openForm(): void {
    this.dialogOpener.openNewDrawingForm();
  }

  openGallery(): void {
    this.dialogOpener.openGallery();
  }

  openGuide(): void {
    this.dialogOpener.openGuide();
  }

  goDrawing(): void {
    this.router.navigate(['/drawing']);
  }

  disconnect(): void {
    this.router.navigate(['']);
  }
}
