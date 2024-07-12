import dotenv from 'dotenv';

dotenv.config();

export const API_KEY = process.env.PINECONE_API_KEY;
export const API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
export const INDEX_NAME = "docs-quickstart-index";
export const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";
