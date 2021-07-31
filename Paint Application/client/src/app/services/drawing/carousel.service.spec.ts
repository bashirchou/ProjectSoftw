import { TestBed } from '@angular/core/testing';
import { Tag } from '@app/classes/tag';
import { ImageDb } from '@common/communication/image';
import { CarouselService } from './carousel.service';

describe('CarouselService', () => {
    let service: CarouselService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CarouselService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' On ifTitleNull, if size  = 2, card3Title should be false', () => {
        service.ifTitleNull(2);
        expect(service.card3Title).toEqual(false);
    });
    it(' On ifTitleNull, if size  = 1, card3Title and card2Title should be false ', () => {
        service.ifTitleNull(1);
        expect(service.card3Title).toEqual(false);
        expect(service.card2Title).toEqual(false);
    });
    it(' On ifTitleNull, if size  = 0, card3Title, card2Title and card1Title should be false ', () => {
        service.ifTitleNull(0);
        expect(service.card3Title).toEqual(false);
        expect(service.card2Title).toEqual(false);
        expect(service.card1Title).toEqual(false);
    });

    it(' on setUpArrayImageFilter, it should filter the array according to the tag from the carousel', () => {
        const image = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        const tag = new Tag('tag');
        const tagsCarousel = [tag];
        const listImage = [image];
        service.setFilterOfArrayImage(listImage, tagsCarousel);
        expect(service.arrayImageTagFilter.length).toBe(1);
        expect(service.arrayImageTagFilter.length).toBe(1);
    });

    it('They array should be filtered according to the tag on the carousel', () => {
        service.arrayImageTagFilter = [];
        const image = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        const tag = new Tag('tag');
        const tagsCarousel = [tag];
        const listImage = [image];
        service.setFilterOfArrayImage(listImage, tagsCarousel);
        expect(service.arrayImageTagFilter[0]).toEqual(listImage[0]);
    });

    it(' on avancerCarousel, it should make the carousel go foward', () => {
        const image1 = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        const image2 = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        const image3 = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        service.arrayImageTagFilter = [image1, image2, image3];
        const MAX = 3;
        service.arrayCarousel.length = MAX;
        const positionCarousel = 4;
        service.arrayCarousel[0] = positionCarousel;
        service.avancerCarousel();
        expect(service.arrayCarousel.length).toBe(MAX);
        expect(service.arrayCarousel[0]).toEqual(0);
    });

    it(' on reculerCarousel, it should make the carousel go backward', () => {
        const image1 = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        const image2 = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        const image3 = {
            title: 'image',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
            fileExtension: 'png',
            _id: '123456789012',
        } as ImageDb;
        service.arrayImageTagFilter = [image1, image2, image3];
        const MAX = 3;
        const positionCarousel = -1;
        service.arrayCarousel[0] = positionCarousel;
        service.arrayCarousel.length = MAX;
        service.reculerCarousel();
        expect(service.arrayCarousel.length).toBe(MAX);
        expect(service.arrayCarousel[0]).toEqual(2);
    });

    it('on ValidateTag, the boolean validateTag finally becomes true.', () => {
        const tag = new Tag('tag');
        const tagsCarousel = [tag];
        service.validateTags(tagsCarousel);
        expect(service.validTags).toBeTrue();
    });

    it('on ValidateTag, the boolean validateTag finally becomes true if the array is empty', () => {
        const tagsCarousel = [] as Tag[];
        service.validateTags(tagsCarousel);
        expect(service.validTags).toBeTrue();
    });
});