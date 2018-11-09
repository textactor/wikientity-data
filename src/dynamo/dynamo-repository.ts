import {
    BaseRepository,
    RepositoryUpdateData,
    RepositoryAccessOptions,
    BaseEntity,
    EntityValidator,
    Repository,
} from '@textactor/domain';


import { sortEntitiesByIds } from '../helpers';
import { DynamoItem } from 'dynamo-item';

export class DynamoRepository<T extends BaseEntity> extends BaseRepository<T> implements Repository<T> {

    constructor(protected item: DynamoItem<{ id: string }, T>, validator: EntityValidator<T>) {
        super(validator);
    }

    async put(data: T) {
        data = this.beforeCreate(data);
        return await this.item.put(data);
    }

    async innerCreate(data: T) {
        return await this.item.create(data);
    }

    async innerUpdate(data: RepositoryUpdateData<T>) {
        return await this.item.update({
            remove: data.delete,
            key: { id: data.id },
            set: data.set
        });
    }

    async delete(id: string) {
        const oldItem = await this.item.delete({ id });
        return !!oldItem;
    }

    async exists(id: string) {
        const item = await this.getById(id, { fields: ['id'] });

        return !!item;
    }

    async getById(id: string, options?: RepositoryAccessOptions<T>) {
        return await this.item.get({ id }, options && { attributes: options.fields as string[] });
    }

    async getByIds(ids: string[], options?: RepositoryAccessOptions<T>) {
        const items = await this.item.getItems(ids.map(id => ({ id })), options && { attributes: options.fields as string[] });

        return sortEntitiesByIds(ids, items);
    }

    async deleteStorage(): Promise<void> {
        await Promise.all([
            this.item.deleteTable(),
        ]);
    }
    async createStorage(): Promise<void> {
        await Promise.all([
            this.item.createTable(),
        ]);
    }
}
