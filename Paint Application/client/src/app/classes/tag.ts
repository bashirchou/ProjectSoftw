export class Tag {
    length: number;
    constructor(public tagName: string) {}
    isValidTag(): boolean {
        return this.tagName.indexOf(' ') < 0;
    }
    isValidTagCarousel(arrayTag: Tag[]): boolean {
        let present = false;
        for (const tag of arrayTag) {
            if (this.tagName === tag.tagName) {
                present = true;
            }
        }
        return present;
    }
}
