import { IRepository, RepUpdateData } from "@textactor/domain";
import { DynamoModel } from "./dynamoModel";

export class DynamoRepository<ID, T extends { id: ID }> implements IRepository<ID, T> {
    constructor(protected model: DynamoModel<ID, T>) { }

    getById(id: ID) {
        return this.model.getById(id);
    }
    getByIds(ids: ID[]): Promise<T[]> {
        return this.model.getByIds(ids);
    }
    exists(id: ID): Promise<boolean> {
        return this.model.getById(id).then(item => !!item);
    }
    delete(id: ID): Promise<boolean> {
        return this.model.delete(id);
    }
    create(data: T): Promise<T> {
        return this.model.create(data);
    }
    update(data: RepUpdateData<ID, T>): Promise<T> {
        return this.model.update(data);
    }
}
