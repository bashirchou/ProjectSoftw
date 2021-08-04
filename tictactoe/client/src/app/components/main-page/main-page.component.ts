import { Component, HostListener } from '@angular/core';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Tik Tak Toe';
    firstPoints: number = 0;
    firstPlayer: string = '';
    secondPlayer: string = '';
    tied: boolean = false;
    secondPoints: number = 0;
    win: boolean = false;
    player: number = 2;
    outcome: string = '';
    playerMoves: string[][] = [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ];
    playerTwoMoves: number[] = [];
    isVisible: boolean[] = [false, false, false, false, false, false, false, false, false];
    isPlayerOne: boolean[] = [true, true, true, true, true, true, true, true, true];
    constructor() {}
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (!this.win) {
            if (event.offsetX > 90 && event.offsetX < 289 && event.offsetY > 25 && event.offsetY < 195 && !this.isVisible[0]) {
                this.isVisible[0] = true;
                this.choosePlayer();
                this.setForm(0);
            } else if (event.offsetX > 322 && event.offsetX < 500 && event.offsetY > 20 && event.offsetY < 191 && !this.isVisible[1]) {
                this.isVisible[1] = true;
                this.choosePlayer();
                this.setForm(1);
            } else if (event.offsetX > 531 && event.offsetX < 726 && event.offsetY > 19 && event.offsetY < 197 && !this.isVisible[2]) {
                this.isVisible[2] = true;
                this.choosePlayer();
                this.setForm(2);
            } else if (event.offsetX > 90 && event.offsetX < 289 && event.offsetY > 223 && event.offsetY < 387 && !this.isVisible[3]) {
                this.isVisible[3] = true;
                this.choosePlayer();
                this.setForm(3);
            } else if (event.offsetX > 322 && event.offsetX < 500 && event.offsetY > 223 && event.offsetY < 387 && !this.isVisible[4]) {
                this.isVisible[4] = true;
                this.choosePlayer();
                this.setForm(4);
            } else if (event.offsetX > 531 && event.offsetX < 726 && event.offsetY > 223 && event.offsetY < 387 && !this.isVisible[5]) {
                this.isVisible[5] = true;
                this.choosePlayer();
                this.setForm(5);
            } else if (event.offsetX > 90 && event.offsetX < 289 && event.offsetY > 415 && event.offsetY < 587 && !this.isVisible[6]) {
                this.isVisible[6] = true;
                this.choosePlayer();
                this.setForm(6);
            } else if (event.offsetX > 322 && event.offsetX < 500 && event.offsetY > 415 && event.offsetY < 587 && !this.isVisible[7]) {
                this.isVisible[7] = true;
                this.choosePlayer();
                this.setForm(7);
            } else if (event.offsetX > 531 && event.offsetX < 726 && event.offsetY > 415 && event.offsetY < 587 && !this.isVisible[8]) {
                this.isVisible[8] = true;
                this.choosePlayer();
                this.setForm(8);
            }
            for (let i = 0; i < 3; i++) {
                if (this.playerMoves[i][0] == 'X' && this.playerMoves[i][1] == 'X' && this.playerMoves[i][2] == 'X') {
                    this.win = true;
                    i = 3;
                }
                if (this.playerMoves[i][0] == 'O' && this.playerMoves[i][1] == 'O' && this.playerMoves[i][2] == 'O') {
                    this.win = true;
                    i = 3;
                }
            }
            this.wincon();
            this.tiedSituation();
        }
    }
    choosePlayer(): void {
        if (this.player == 1) {
            this.player = 2;
        } else {
            this.player = 1;
        }
    }
    setForm(quadrant: number): void {
        if (this.player == 1) {
            this.isPlayerOne[quadrant] = true;
            if (quadrant + 1 <= 3) {
                this.playerMoves[0][quadrant] = 'X';
            } else if (quadrant + 1 <= 6 && quadrant + 1 > 3) {
                this.playerMoves[1][quadrant % 3] = 'X';
            } else {
                this.playerMoves[2][quadrant % 3] = 'X';
            }
        } else {
            this.isPlayerOne[quadrant] = false;
            if (quadrant + 1 <= 3) {
                this.playerMoves[0][quadrant] = 'O';
            } else if (quadrant + 1 <= 6 && quadrant + 1 > 3) {
                this.playerMoves[1][quadrant % 3] = 'O';
            } else {
                this.playerMoves[2][quadrant % 3] = 'O';
            }
        }
    }
    wincon(): void {
        for (let i = 0; i < 3; i++) {
            if (this.playerMoves[0][i] == 'X' && this.playerMoves[1][i] == 'X' && this.playerMoves[2][i] == 'X') {
                this.win = true;
                this.firstPoints += 1;
                i = 3;
            }
            if (this.playerMoves[0][i] == 'O' && this.playerMoves[1][i] == 'O' && this.playerMoves[2][i] == 'O') {
                this.win = true;
                this.secondPoints += 1;
                i = 3;
            }
        }
        if (this.playerMoves[0][0] == 'X' && this.playerMoves[1][1] == 'X' && this.playerMoves[2][2] == 'X') {
            this.win = true;
            this.firstPoints += 1;
        } else if (this.playerMoves[0][0] == 'O' && this.playerMoves[1][1] == 'O' && this.playerMoves[2][2] == 'O') {
            this.win = true;
            this.secondPoints += 1;
        } else if (this.playerMoves[0][2] == 'X' && this.playerMoves[1][1] == 'X' && this.playerMoves[2][0] == 'X') {
            this.win = true;
            this.firstPoints += 1;
        } else if (this.playerMoves[0][2] == 'O' && this.playerMoves[1][1] == 'O' && this.playerMoves[2][0] == 'O') {
            this.win = true;
            this.secondPoints += 1;
        }
        if (this.win) {
            this.outcome = this.firstPlayer + 'WINNER';
        }
    }
    tiedSituation(): void {
        for (let i = 0; i < this.isVisible.length; i++) {
            if (this.isVisible[i]) {
                this.tied = true;
            } else {
                this.tied = false;
                i = this.isVisible.length;
            }
        }
        console.log(this.tied);
        if (this.tied && !this.win) {
            this.outcome = 'TIED';
        }
    }
    reset(): void {
        for (let i = 0; i < this.isVisible.length; i++) {
            this.isVisible[i] = false;
            this.isPlayerOne[i] = false;
        }
        this.win = false;
        this.tied = false;
        this.outcome = '';
        this.player = 2;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.playerMoves[i][j] = '';
            }
        }
    }
    restart(): void {
        this.reset();
        this.firstPoints = this.secondPoints = 0;
    }
}
