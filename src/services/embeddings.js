import { EmbeddingModel, FlagEmbedding } from "fastembed";
import { Document, SimpleDirectoryReader } from 'llamaindex';
import { chunkText } from '../utils/chunk.js';

export async function getEmbeddingModel() {
    const embeddingModel = await FlagEmbedding.init({
        model: EmbeddingModel.AllMiniLML6V2
    });
    return embeddingModel;
}

export async function getChunkedDocs(folderName) {
    const MAX_TEXT_LENGTH = 100000; // Example limit, adjust as needed
    const documents = await new SimpleDirectoryReader().loadData({ directoryPath: `./uploads/${folderName}` });

    const chunkedDocuments = [];
    let len = 0;
    documents.forEach(doc => {
        if (len > MAX_TEXT_LENGTH) {
            throw new Error(`Document exceeds the maximum allowed text length of ${MAX_TEXT_LENGTH} characters.`);
        }
        len += doc.text.length;
        // console.log(doc.text.length);
        const chunks = chunkText(doc.text);
        chunks.forEach(chunk => {
            chunkedDocuments.push(new Document({ text: chunk }));
        });
    });

    return chunkedDocuments;
}


export async function getEmbeddings(folderName) {
    const embeddingModel = await getEmbeddingModel();
    const chunkedDocuments = await getChunkedDocs(folderName);
    const embeddings = embeddingModel.embed(chunkedDocuments.map(doc => doc.text), 1);
    const arr = [];
    for await (const batch of embeddings) {
        batch.forEach((el) => { arr.push(Array.from(el)); });
    }
    return { embeddings: arr, chunkedDocuments };
}
