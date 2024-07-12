import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getAllProjects, storeProjectInfo, uploadPdfToFirebase } from '../utils/dbFunctions.js';
import { getIndex, insertEmbeddingsIntoDB } from '../services/index.js';
import { deleteFolder } from '../utils/files.js';
import { getEmbeddingModel } from '../services/embeddings.js';
import { generateResponse, retrieveDocuments } from '../services/llm.js';

export const uploadPdf = async (req, res) => {
    const file = req.file;
    const userID = req.headers['userid'];

    if (!file || !userID) {
        return res.status(400).json({ error: "No file part or User ID not provided" });
    }

    if (!file.originalname.endsWith('.pdf')) {
        return res.status(400).json({ error: "Invalid file type, please upload a PDF file" });
    }

    try {
        // Generate a random string
        const randomString = uuidv4();

        // Create a folder with the name equal to the random string
        const folderPath = path.join('uploads', randomString);
        fs.mkdirSync(folderPath, { recursive: true });

        // Save the file into the created folder
        const savePath = path.join(folderPath, file.originalname);
        fs.renameSync(file.path, savePath);

        // Define the local and cloud paths for the file
        const localPdfPath = savePath;
        const cloudPdfPath = `pdfs/${randomString}/${file.originalname}`;

        await uploadPdfToFirebase(localPdfPath, cloudPdfPath);
        const projectID = await storeProjectInfo(userID, cloudPdfPath);

        await insertEmbeddingsIntoDB(randomString, projectID);
        deleteFolder(randomString);

        res.status(200).json({ message: "File processed and saved successfully", projectID: projectID });
        console.log("File processed and saved successfully");
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "An error occurred while processing the file" });
    }
}

export const getProjects = async (req, res) => {
    const userID = req.headers['userid'];
    if (!userID) {
        return res.status(400).json({ error: "User ID not provided in headers" });
    }

    try {
        const projects = await getAllProjects(userID);

        if (!projects.exists()) {
            return res.status(404).json({ error: "No projects found for this user" });
        }

        res.status(200).json(projects.data());
    } catch (error) {
        console.error("Error retrieving projects:", error);
        res.status(500).json({ error: "Error retrieving projects" });
    }
}

export const queryResponse = async (req, res) => {
    const { query, projectID } = req.body;
    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        const index = getIndex();
        const embeddingModel = await getEmbeddingModel();
        const retrievedDocs = await retrieveDocuments(query, index, embeddingModel, projectID);
        console.log(retrievedDocs);
        const response = await generateResponse(query, retrievedDocs);
        res.json({ response });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "An error occurred while generating the response" });
    }
}
