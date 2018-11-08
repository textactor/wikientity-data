import { DynamoModel, DynamoModelOptions, ModelOptions, buildDynamoOptions } from "./dynamo-model";
import { WikiEntity } from "@textactor/wikientity-domain";
import * as Joi from 'joi';
import { LANG_REG, WIKI_DATA_ID_REG } from "../helpers";
import { RepUpdateData } from "@textactor/domain";

export class WikiEntityModel extends DynamoModel<string, WikiEntity> {
    constructor(options?: ModelOptions) {
        options = options || {};

        super(buildDynamoOptions(OPTIONS, options), options.dynamodb);
    }

    protected beforeCreating(data: WikiEntity): WikiEntity {
        data = super.beforeCreating(data);
        const ts = Math.round(Date.now() / 1000);
        data.createdAt = data.createdAt || ts;
        data.updatedAt = data.createdAt || ts;

        return data;
    }

    protected beforeUpdating(data: RepUpdateData<string, WikiEntity>) {
        data = super.beforeUpdating(data);
        if (data.set) {
            delete data.set.createdAt;
            delete data.set.lang;
            data.set.updatedAt = data.set.updatedAt || Math.round(Date.now() / 1000);
        }

        return data;
    }

    protected transformData(data: any): WikiEntity {
        if (data) {
            delete data.locale;
        }
        return super.transformData(data);
    }
}

const OPTIONS: DynamoModelOptions = {
    name: 'textactor:WikiEntity',
    tableName: 'textactor_wiki_entities_v1',
    hashKey: 'id',
    schema: {
        id: Joi.string().regex(/^[A-Z]{2}Q\d+$/).required(),
        lang: Joi.string().regex(LANG_REG).required(),
        name: Joi.string().min(2).max(200).required(),
        aliases: Joi.array().items(Joi.string().min(2).max(200)).unique().max(10),
        abbr: Joi.string().min(1).max(50),
        wikiDataId: Joi.string().regex(WIKI_DATA_ID_REG).required(),
        wikiPageId: Joi.number().integer(),
        wikiPageTitle: Joi.string().min(2).max(200),
        type: Joi.valid('EVENT', 'ORG', 'PERSON', 'PLACE', 'PRODUCT', 'WORK'),
        types: Joi.array().items(Joi.string().min(2).max(50)).unique().max(20),
        description: Joi.string().max(200),
        about: Joi.string().max(800),
        categories: Joi.array().items(Joi.string().min(2).max(250)).unique().max(10),
        data: Joi.object().pattern(/^P\d+$/, Joi.array().items(Joi.string().min(1).max(500).required()).min(1).max(10)),
        countLinks: Joi.number().integer().min(1).max(500).required(),

        createdAt: Joi.number().integer().required(),
        updatedAt: Joi.number().integer().required(),
    }
}
