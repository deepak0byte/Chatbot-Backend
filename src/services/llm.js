import axios from 'axios';
import { API_TOKEN, API_URL } from '../config/env.js';
import { Document } from 'llamaindex';

export async function callLLM(payload) {
    const headers = { "Authorization": `Bearer ${API_TOKEN}` };
    const response = await axios.post(API_URL, payload, { headers });
    return response.data;
}

export async function retrieveDocuments(query, index, embeddingModel, projectID, top_k = 5) {
    try {
        let queryEmbedding = await embeddingModel.queryEmbed(query);
        queryEmbedding = [Array.from(queryEmbedding)];
        const result = await index.namespace(projectID).query({ vector: queryEmbedding[0], topK: top_k, includeMetadata: true });
        return result.matches.map(item => new Document({ text: item.metadata.text }));
    } catch (error) {
        console.log(error);
    }
}

export async function generateResponse(query, retrievedDocs) {
    try {
        const context = retrievedDocs.map(doc => doc.text).join(' ');
        const inputText = `Context: ${context}\n Answer the below question using above context \nQuery: ${query}`;
        const payload = {
            inputs: inputText,
            parameters: {
                max_new_tokens: 100
            }
        };
        const data = await callLLM(payload);
        // Extract only the text after the last newline character
        const responseText = data[0].generated_text;
        const lastNewlineIndex = responseText.lastIndexOf('\n');

        if (lastNewlineIndex !== -1) {
            return responseText.substring(lastNewlineIndex + 1).trim();
        }

        // If no newline is found, return the full response
        return responseText.trim();
    } catch (error) {
        console.log(error);
    }
}
