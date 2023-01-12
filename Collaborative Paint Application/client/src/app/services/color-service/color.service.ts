import { Injectable } from '@angular/core';
import { Color } from '../../Classes/color';
import { ColorPickerTarget } from '../../Classes/enums/color-picker-target';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private readonly MAX_RECENT_COLORS: number = 10;
  recentColors: Color[];
  primaryColor: Color;
  secondaryColor: Color;
  backgroundColor: Color;
  inputBackgroundColor: Color;

  constructor() {
    this.setDefaultColorsValue();
  }

  addRecentColor(color: Color): void {
    this.recentColors.unshift(Color.cloneColor(color));
    if (this.recentColors.length >= this.MAX_RECENT_COLORS) {
      this.recentColors.pop();
    }

  }

  setRecentToPrimary(index: number): void {
    if (this.isIndexValid(index)) {
      this.primaryColor.setRGB(this.recentColors[index]);
    }
  }

  setRecentToSecondary(index: number): void {
    if (this.isIndexValid(index)) {
      this.secondaryColor.setRGB(this.recentColors[index]);
    }
  }

  inverseColors(): void {
    const temp: Color = Color.cloneColor(this.primaryColor);
    this.primaryColor.setRGB(this.secondaryColor);
    this.secondaryColor.setRGB(temp);
  }

  updateColor(newColor: Color, component: ColorPickerTarget): void {
    console.log(newColor)
    this.getColor(component).setRGB(newColor);
    if (component !== ColorPickerTarget.InputBackground) {
      this.addRecentColor(newColor);
    }
  }

  confirmBackgroundColor(): void {
    this.backgroundColor = Color.cloneColor(this.inputBackgroundColor);
    this.setDefaultInputBackground();
  }

  getColor(component: ColorPickerTarget): Color {
    switch (component) {
      case ColorPickerTarget.Primary:
        return this.primaryColor;

      case ColorPickerTarget.Secondary:
        return this.secondaryColor;

      case ColorPickerTarget.Background:
        return this.backgroundColor;

      case ColorPickerTarget.InputBackground:
        return this.inputBackgroundColor;
    }
  }

  setDefaultInputBackground(): void {
    this.inputBackgroundColor = Color.cloneColor(Color.WHITE);
  }

  private setDefaultColorsValue(): void {
    this.primaryColor = Color.cloneColor(Color.BLACK);
    this.secondaryColor = Color.cloneColor(Color.BLACK);
    this.backgroundColor = Color.cloneColor(Color.WHITE);
    this.setDefaultInputBackground();

    this.recentColors = [];
    for (let i = 0; i < this.MAX_RECENT_COLORS; i++) {
      this.recentColors.push(Color.cloneColor(Color.WHITE));
    }
  }

  private isIndexValid(index: number): boolean {
    return index >= 0 && index < this.recentColors.length;
  }

}
