import { Injectable } from '@angular/core';
import { alphaPos, leftMouseClick, maxColorValue, pixelLenght, rightMouseClick, ToolSelector } from '@app/classes/constant';
import { Point } from '@app/classes/point';
import { Tool } from '@app/classes/tool';
import { BucketCommand } from '@app/classes/undoredoCommands/bucket-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class BucketPaintingService extends Tool {
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, ToolSelector.PaintingBucket, 'paint-bucket', true, 'Sceau de peinture', 'b');
    }

    static minColorTolerance: number = 0;
    static maxColorTolerance: number = 100;

    // tslint:disable-next-line: no-magic-numbers  Here is all directions up, down, left, right
    private DIRECTIONS = [new Point(0, 1), new Point(1, 0), new Point(0, -1), new Point(-1, 0)];

    private clickedColor: [red: number, green: number, blue: number];
    colorTolerance: number = 3;

    isSameColor(point: Point, imageData: ImageData): boolean {
        const indexImageData = (point.x + point.y * this.drawingService.canvas.width) * pixelLenght;
        const colorToValidate = [];
        for (let pixelOffset = 0; pixelOffset < this.clickedColor.length; pixelOffset++) {
            colorToValidate.push(imageData.data[indexImageData + pixelOffset]);
        }
        // tslint:disable-next-line: no-magic-numbers
        return this.calculateDistanceBetweenColor(this.clickedColor, colorToValidate) <= this.colorTolerance / 100;
    }

    getColorArray(): string[] {
        let color = this.drawingService.primaryColor;
        color = color.replace('rgba(', '');
        color = color.replace(')', '');
        const colorsPixel = color.split(',');
        if (parseInt(colorsPixel[alphaPos], 10) === 1) colorsPixel[alphaPos] = '' + maxColorValue;
        return colorsPixel;
    }
    changeColor(point: Point, imageData: ImageData): void {
        const index = (point.x + point.y * this.drawingService.canvas.width) * pixelLenght;

        let offset = 0;
        for (const color of this.getColorArray()) {
            imageData.data[index + offset] = parseInt(color, 10);
            offset++;
        }
    }

    noContiguousPixel(): void {
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        for (let i = 0; i < this.drawingService.canvas.height; i++) {
            for (let j = 0; j < this.drawingService.canvas.width; j++) {
                const point = new Point(j, i);
                if (this.isSameColor(point, imageData)) {
                    this.changeColor(point, imageData);
                }
            }
        }
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
    }

    calculateDistanceBetweenColor(color1: number[], color2: number[]): number {
        const redDistance = Math.pow(color2[0] - color1[0], 2);
        const greenDistance = Math.pow(color2[1] - color1[1], 2);
        const blueDistance = Math.pow(color2[2] - color1[2], 2);

        const distance = Math.sqrt(redDistance + greenDistance + blueDistance);
        return distance / Math.sqrt((pixelLenght - 1) * Math.pow(maxColorValue, 2));
    }
    contiguousPixel(startPoint: Point): void {
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const queue: Point[] = [];
        const visited: boolean[][] = new Array(this.drawingService.baseCtx.canvas.width + 1)
            .fill(false)
            .map(() => new Array(this.drawingService.baseCtx.canvas.height + 1).fill(false));

        const pixelInQueue = new Set<Point>();
        queue.push(startPoint);
        pixelInQueue.add(startPoint);
        this.changeColor(startPoint, imageData);

        while (queue.length !== 0) {
            const point = queue.pop();
            if (point != undefined) {
                for (const direction of this.DIRECTIONS) {
                    const pointNear = point.add(direction);
                    if (this.drawingService.isPointsOnCanvas(pointNear.x, pointNear.y) && this.isSameColor(pointNear, imageData)) {
                        if (!visited[pointNear.x][pointNear.y] && !pixelInQueue.has(pointNear)) {
                            queue.push(pointNear);
                            pixelInQueue.add(pointNear);
                            this.changeColor(pointNear, imageData);
                        }
                    }
                }
                visited[point.x][point.y] = true;
            }
        }
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
    }

    setClickedColor(clickedPoint: Point): void {
        const pixel = this.drawingService.baseCtx.getImageData(clickedPoint.x, clickedPoint.y, 1, 1).data;
        this.clickedColor = [pixel[0], pixel[1], pixel[2]];
    }

    onMouseDown(event: MouseEvent): void {
        if (this.drawingService.mouseOnCanvas) {
            const clickedPoint = new Point(event.offsetX, event.offsetY);
            this.setClickedColor(clickedPoint);
            let command;
            switch (event.button) {
                case leftMouseClick:
                    command = new BucketCommand(this, true, clickedPoint);
                    break;
                case rightMouseClick:
                    command = new BucketCommand(this, false, clickedPoint);
                    break;
                default:
            }
            if (command != undefined) {
                this.undoRedoService.addCommand(command);
                command.execute();
            }
            event.preventDefault();
        }
    }
}
