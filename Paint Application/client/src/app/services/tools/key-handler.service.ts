import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class KeyHandlerService {
    private keys: Set<string> = new Set();
    isShortcutActive: boolean = true;
    private shorcuts: Map<string, Subject<string>> = new Map();
    onKeyDown(event: KeyboardEvent): void {
        const keyPressed = event.key.toLowerCase();
        this.keys.add(keyPressed);
        this.iterateOverShortcuts(event);
        if (!this.isShortcutActive) {
            if (this.isSpecialKeyPressed(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.keys.delete(event.key.toLowerCase());
        this.iterateOverShortcuts(event);
    }

    isKeyDown(key: string): boolean {
        return this.keys.has(key.toLowerCase());
    }

    iterateOverShortcuts(event: KeyboardEvent): void {
        for (const tuple of this.shorcuts) {
            if (this.validateShortCuts(tuple[0], event)) {
                tuple[1].next(tuple[0]);
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    private isSpecialKeyPressed(event: KeyboardEvent): boolean {
        return event.shiftKey || event.altKey || event.ctrlKey || event.metaKey;
    }

    private isSimpleShortcut(key: string): boolean {
        return !key.includes('control') && !key.includes('alt') && !key.includes('shift');
    }

    validateShortCuts(key: string, event: KeyboardEvent): boolean {
        if (this.isShortcutActive) {
            const keys = key.split(' ');
            if (this.isSpecialKeyPressed(event) && this.isSimpleShortcut(key)) {
                return false;
            }
            for (const keyPress of keys) {
                if (!this.isKeyDown(keyPress)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    getObservableFromShortcut(shortcut: string): Observable<string> {
        const subject = this.shorcuts.get(shortcut);
        if (subject != undefined) {
            return subject.asObservable();
        }
        const newSubject = new Subject<string>();
        this.shorcuts.set(shortcut, newSubject);
        return newSubject.asObservable();
    }
}
