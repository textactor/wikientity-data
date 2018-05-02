
const dynamo = require('dynamodb');

export function createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
        dynamo.createTables((error: Error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        })
    });
}
