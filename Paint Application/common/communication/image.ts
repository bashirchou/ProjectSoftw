export interface Image {
    title: string;
    tags: string[];
    data: string;
}

export interface ImageId {
    imageId: string;
}

export interface ImageDb {
    title: string;
    tags: string[];
    data: string;
    fileExtension: string;
    _id: string;
}
