import { Command } from '@app/classes/undoredoCommands/command';
import { Vec2 } from '@app/classes/vec2';
import { TexteService } from '@app/services/tools/texte.service';

export class TexteCommand extends Command {
    constructor(
        private texteService: TexteService,
        // private drawingService: DrawingService,
        private editing: boolean,
        private isItalic: boolean,
        private isBold: boolean,
        private text: string,
        private textAlign: string,
        private maxCharByLine: number,
        private fontSize: number,
        private fontStyle: string,
        private width: number,
        private height: number,
        private initialPoint: Vec2,
        private color: string,
    ) {
        super();
    }

    execute(): void {
        this.texteService.drawText(
            this.editing,
            this.isItalic,
            this.isBold,
            this.text,
            this.textAlign,
            this.maxCharByLine,
            this.fontSize,
            this.fontStyle,
            this.width,
            this.height,
            this.initialPoint,
            this.color,
        );
    }
}
