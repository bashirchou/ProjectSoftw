import { Injectable } from '@angular/core';
import { Tag } from '@app/classes/tag';
import { ImageDb } from '@common/communication/image';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    private canvasArrayMaxLength: number = 3;
    arrayCarousel: number[] = [];
    ctxArray: CanvasRenderingContext2D[] = [];
    arrayImageTagFilter: ImageDb[] = [];
    validTagArray: Tag[] = [];
    validTags: boolean = true;

    card1Title: boolean = true;
    card2Title: boolean = true;
    card3Title: boolean = true;

    ifTitleNull(size: number): void {
        // tslint:disable-next-line: prefer-switch
        if (size === 2) {
            this.card3Title = false;
        } else if (size === 1) {
            this.card3Title = false;
            this.card2Title = false;
        } else if (size === 0) {
            this.card1Title = false;
            this.card2Title = false;
            this.card3Title = false;
        }
    }

    setFilterOfArrayImage(listImage: ImageDb[], tagsCarousel: Tag[]): void {
        let cpt = 0;
        this.arrayImageTagFilter = [];
        for (const imageDb of listImage) {
            this.arrayImageTagFilter.push(imageDb);
        }
        for (const imageDb of listImage) {
            for (const tagCarousel of tagsCarousel) {
                for (const tagImage of imageDb.tags) {
                    if (tagImage === tagCarousel.tagName) {
                        this.arrayImageTagFilter[cpt] = imageDb;
                        this.validTagArray[cpt] = tagCarousel;
                        cpt++;
                    }
                }
            }
        }
        if (cpt !== 0) {
            this.arrayImageTagFilter.splice(cpt, this.arrayImageTagFilter.length - cpt);
        }
    }

    avancerCarousel(): void {
        if (this.arrayCarousel.length === this.canvasArrayMaxLength) {
            if (this.arrayImageTagFilter[this.arrayCarousel.length - 1] != null) {
                for (let i = 0; i < this.arrayCarousel.length; i++) {
                    this.arrayCarousel[i] = this.arrayCarousel[i] + 1;
                    if (this.arrayCarousel[i] > this.arrayImageTagFilter.length - 1) {
                        this.arrayCarousel[i] = 0;
                    }
                }
            }
        }
    }
    reculerCarousel(): void {
        if (this.arrayCarousel.length === this.canvasArrayMaxLength) {
            if (this.arrayImageTagFilter[this.arrayCarousel.length - 1] != null) {
                for (let i = 0; i < this.arrayCarousel.length; i++) {
                    this.arrayCarousel[i] = this.arrayCarousel[i] - 1;
                    if (this.arrayCarousel[i] < 0) {
                        this.arrayCarousel[i] = this.arrayImageTagFilter.length - 1;
                    }
                }
            }
        }
    }

    validateTags(tagsCarousel: Tag[]): void {
        if (tagsCarousel.length === 0) {
            this.validTags = true;
        }
        for (const tag of tagsCarousel) {
            if (!tag.isValidTagCarousel(this.validTagArray)) {
                this.validTags = false;
            }
        }
        this.validTags = true;
    }
}
