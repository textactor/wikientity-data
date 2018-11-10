import DynamoDB = require('aws-sdk/clients/dynamodb');

import { DynamoRepository } from './dynamo-repository';
import { WikiEntity, WikiEntityValidator, WikiEntityRepository } from '@textactor/wikientity-domain';
import { DynamoWikiEntityItem } from './dynamo-wiki-entity';
import { RepositoryUpdateData } from '@textactor/domain';


export class DynamoWikiEntityRepository extends DynamoRepository<WikiEntity> implements WikiEntityRepository {
    constructor(client: DynamoDB.DocumentClient, tableSuffix: string) {
        super(new DynamoWikiEntityItem(client, tableSuffix), new WikiEntityValidator());
    }

    async createOrUpdate(data: WikiEntity) {
        try {
            return await this.create(data);
        } catch (e) {
            if (e.code === 'ConditionalCheckFailedException') {
                const dbData = await this.getById(data.id);
                if (!dbData) {
                    throw new Error(`Not found wiki entity on updating: ${data.id}`);
                }

                data = { ...data };
                data.createdAt = dbData.createdAt;
                data.updatedAt = Math.round(Date.now() / 1000);

                return this.put(data);
            }
            return Promise.reject(e);
        }
    }

    protected beforeCreate(data: WikiEntity) {
        const ts = Math.round(Date.now() / 1000);
        data.createdAt = data.createdAt || ts;
        data.updatedAt = data.updatedAt || data.createdAt;

        return super.beforeCreate(data);
    }

    protected beforeUpdate(data: RepositoryUpdateData<WikiEntity>) {
        data.set = data.set || {};
        data.set.updatedAt = data.set.updatedAt || Math.round(Date.now() / 1000);

        return super.beforeUpdate(data);
    }
}
