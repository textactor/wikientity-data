
const dynamo = require('dynamodb');
import { RepUpdateData } from "@textactor/domain";

export interface DynamoModelOptions {
    name: string
    tableName: string
    hashKey: string
    rangeKey?: string
    schema: any
    indexes?: { hashKey?: string, rangeKey?: string, type: 'local' | 'global', name: string, projection?: any }[]
}

export class DynamoModel<ID, T> {
    protected Model: any
    private fields: string[]
    constructor(private options: DynamoModelOptions, dynamodb?: any) {
        this.Model = dynamo.define(options.name, {
            hashKey: options.hashKey,
            rangeKey: options.rangeKey,
            timestamps: false,
            schema: options.schema,
            tableName: options.tableName,
            indexes: options.indexes,
        });
        this.fields = Object.keys(options.schema);
        if (dynamodb) {
            this.Model.config({ dynamodb: dynamodb });
        }
    }

    deleteTable(secret: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!secret || secret !== process.env.DYNAMODB_DELETE_SECRET) {
                return reject(new Error(`'secret' is not valid!`));
            }
            this.Model.deleteTable((error: Error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            })
        });
    }

    getById(id: ID): Promise<T> {
        return new Promise((resolve, reject) => {
            const params = formatParams();

            this.Model.get(id, params, (error: Error, result: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(this.transformData(result));
            });
        });
    }

    getByIds(ids: ID[]): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const params = formatParams();

            this.Model.getItems(ids, params, (error: Error, result: any[]) => {
                if (error) {
                    return reject(error);
                }
                resolve(result && result.map(item => this.transformData(item)) || []);
            });
        });
    }

    put(item: T): Promise<T> {
        item = this.beforeCreating(item);
        return new Promise((resolve, reject) => {
            const params = formatParams();
            params.overwrite = true;

            // debug('creating place: ', dataPlace);
            this.Model.create(item, params, (error: Error, result: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(this.transformData(result));
            });
        });
    }

    delete(id: ID): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.Model.destroy(id, (error: Error) => {
                if (error) {
                    return reject(error);
                }
                resolve(true);
            });
        });
    }

    create(item: T): Promise<T> {
        item = this.beforeCreating(item);
        return new Promise((resolve, reject) => {
            const params = formatParams();
            params.overwrite = false;
            this.Model.create(item, params, (error: Error, result: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(this.transformData(result));
            });
        });
    }

    update(data: RepUpdateData<T>): Promise<T> {
        data = this.beforeUpdating(data);
        return new Promise((resolve, reject) => {
            const params = formatParams();
            params.expected = {};
            params.expected[this.options.hashKey] = (<any>data.item)[this.options.hashKey];
            if (this.options.rangeKey !== undefined) {
                params.expected[this.options.rangeKey] = (<any>data.item)[this.options.rangeKey];
            }

            let updateItem: any = { ...(data.item as any) };
            if (data.delete && data.delete.length) {
                data.delete.forEach(item => updateItem[item] = null);
            }

            this.Model.update(updateItem, params, (error: Error, result: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(this.transformData(result));
            });
        });
    }

    createOrUpdate(item: T): Promise<T> {
        return this.create(item)
            .catch(error => {
                if (error.code === 'ConditionalCheckFailedException') {
                    return this.update({ item });
                }
                return Promise.reject(error);
            });
    }

    query(params: DynamoQueryParams): Promise<DynamoQueryResult<T>> {
        var query = this.Model.query(params.hashKey);

        if (params.startKey) {
            query.startKey(params.startKey);
        }
        if (params.index) {
            query.usingIndex(params.index);
        }
        if (params.limit) {
            query.limit(params.limit);
        }
        if (params.attributes) {
            query.attributes(params.attributes);
        }
        // if (params.consistentRead === true) {
        //     query.consistentRead(true);
        // }
        if (params.sort) {
            query[params.sort]();
        }
        if (params.rangeKey) {
            var rangeKey = params.rangeKey.name;
            query.where(rangeKey)[params.rangeKey.op](params.rangeKey.value);
        }
        if (params.select) {
            query.select(params.select);
        }

        if (params.filterExpression) {
            query.filterExpression(params.filterExpression);
            if (params.expressionAttributeNames) {
                query.expressionAttributeNames(params.expressionAttributeNames);
            }
            if (params.expressionAttributeValues) {
                query.expressionAttributeValues(params.expressionAttributeValues);
            }
        }
        if (params.projectionExpression) {
            query.projectionExpression(params.projectionExpression);
        }

        return new Promise<DynamoQueryResult<T>>((resolve, reject) => {
            query.exec((error: Error, result: any) => {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return resolve(null);
                }

                const data: DynamoQueryResult<T> = {
                    count: <number>result.Count
                };

                if (result.Items) {
                    data.items = result.Items.map((item: any) => this.transformData(item));
                }

                resolve(data);
            });
        });
    }

    protected transformData(data: any): T {
        if (!data) {
            return null;
        }
        const report = <T>data.get();
        return report;
    }

    protected beforeCreating(data: T): T {
        return this.prepareData(data);
    }

    protected beforeUpdating(data: RepUpdateData<T>): RepUpdateData<T> {
        data = { ...<any>data };
        data.item = this.prepareData(data.item);
        return data;
    }

    protected prepareData(data: T): T {
        data = { ...<any>data };
        for (let prop of Object.keys(data)) {
            if (this.fields.indexOf(prop) < 0) {
                delete (<any>data)[prop];
            }
        }
        return data;
    }
}

export type DynamoQueryResult<T> = {
    items?: T[]
    count: number
}

export type DynamoQueryParams = {
    hashKey: string
    select?: 'COUNT' | 'ALL_PROJECTED_ATTRIBUTES' | 'ALL_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES'
    index?: string
    attributes?: string[]
    sort?: 'descending' | 'ascending'
    limit: number
    rangeKey?: { name: string, op: 'gte' | 'gt' | 'lt' | 'lte' | 'equals' | 'beginsWith' | 'between', value: number | string }
    startKey?: any
    projectionExpression?: string
    filterExpression?: string
    expressionAttributeNames?: any
    expressionAttributeValues?: any
}

function formatParams(): { [key: string]: any } {
    return {};
}
