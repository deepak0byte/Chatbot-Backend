import { Pinecone } from '@pinecone-database/pinecone';
import { API_KEY, INDEX_NAME } from '../config/env.js';
import { getEmbeddings } from './embeddings.js';

const pc = new Pinecone({
    apiKey: API_KEY,
});

export function getIndex() {
    return pc.Index(INDEX_NAME);
}

export async function insertEmbeddingsIntoDB(folderName, projectID) {
    const { embeddings, chunkedDocuments } = await getEmbeddings(folderName);
    const indexes = (await pc.listIndexes()).indexes;
    if (!indexes.some(el => el.name === INDEX_NAME)) {
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: embeddings[0].length,
            metric: "cosine",
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });
    }

    const index = getIndex();
    const vectors = chunkedDocuments.map((doc, i) => ({
        id: i.toString(),
        values: embeddings[i],
        metadata: { text: doc.text },
    }));
    await index.namespace(projectID).upsert(vectors);
}
