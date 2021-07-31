import { Injectable } from '@angular/core';
import { MouseButton, ToolSelector } from '@app/classes/constant';
import { Tracer } from '@app/classes/tracer';
// tslint:disable-next-line: no-relative-imports
import { AerosolCommand } from '@app/classes/undoredoCommands/aerosol-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo.service';

export interface Spray {
    angle: number[];
    radius: number[];
    path: Vec2;
    goutteDiameter: number;
    rotation: number;
    beginAngle: number;
    endAngle: number;
}
@Injectable({
    providedIn: 'root',
})
export class AerosolService extends Tracer {
    static minEmission: number = 1;
    static maxEmission: number = 200;
    static minJetDiameter: number = 1;
    static maxJetDiameter: number = 50;
    static minGoutteDiameter: number = 1;
    static maxGoutteDiameter: number = 5;

    emission: number = 100;
    private path: Vec2;
    private time: number = 20;
    private timer: ReturnType<typeof setInterval>;
    private minAngle: number = 0;
    private maxAngle: number = Math.PI * 2;
    private minLength: number = 0;
    jetDiameter: number = 20;
    goutteDiameter: number = 2;
    private rotation: number = 0;
    private beginAngle: number = 0;
    private endAngle: number = 2 * Math.PI;
    private angle: number[] = [];
    private radius: number[] = [];
    private sprayTab: Spray[] = [];

    constructor(drawingService: DrawingService, private undoredoService: UndoRedoService) {
        super(drawingService, ToolSelector.Aerosol, 'sprayIcon', true, 'aerosol', 'a');
    }

    set emissionPoint(emission: number) {
        if (emission >= AerosolService.minEmission && emission <= AerosolService.maxEmission) {
            this.emission = emission;
        }
    }

    get emissionPoint(): number {
        return this.emission;
    }

    generateRandom(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            clearInterval(this.timer);
            this.mouseDown = false;

            this.undoredoService.addCommand(new AerosolCommand(this, this.drawingService, this.sprayTab, this.drawingService.primaryColor));
            this.sprayTab = [];
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.path = { x: event.offsetX, y: event.offsetY };
        }
    }

    spray(
        drawingService: DrawingService,
        angle: number[],
        radius: number[],
        path: Vec2,
        goutteDiameter: number,
        rotation: number,
        beginAngle: number,
        endAngle: number,
        color: string,
    ): void {
        this.drawingService.baseCtx.lineJoin = this.drawingService.baseCtx.lineCap = 'round';
        this.drawingService.baseCtx.fillStyle = color;

        for (let i = this.emission; i--; ) {
            drawingService.baseCtx.beginPath();
            drawingService.baseCtx.ellipse(
                path.x + radius[i] * Math.cos(angle[i]),
                path.y + radius[i] * Math.sin(angle[i]),
                goutteDiameter / 2,
                goutteDiameter / 2,
                rotation,
                beginAngle,
                endAngle,
            );
            this.drawingService.baseCtx.fill();
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && this.drawingService.mouseOnCanvas) {
            this.path = { x: event.offsetX, y: event.offsetY };

            const callback = () => {
                for (let i = this.emission; i--; ) {
                    this.angle[i] = this.generateRandom(this.minAngle, this.maxAngle);
                    this.radius[i] = this.generateRandom(this.minLength, this.jetDiameter / 2);
                    // TODO: Check si ca marche ca:
                    // clearInterval(this.timer);
                }
                const currentSpray = {
                    angle: [...this.angle],
                    radius: [...this.radius],
                    path: this.path,
                    goutteDiameter: this.goutteDiameter,
                    rotation: this.rotation,
                    beginAngle: this.beginAngle,
                    endAngle: this.endAngle,
                };
                this.sprayTab.push(currentSpray);
                this.spray(
                    this.drawingService,
                    this.angle,
                    this.radius,
                    this.path,
                    this.goutteDiameter,
                    this.rotation,
                    this.beginAngle,
                    this.endAngle,
                    this.primaryColor,
                );
            };
            this.timer = setInterval(callback, this.time);
        }
    }
}
