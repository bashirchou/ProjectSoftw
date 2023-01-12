import {Service} from 'typedi';
@Service()
export class ExpositionService {
    exposition: Map<number, number[]>;
    constructor () {
        this.exposition = new Map();
    }

}
