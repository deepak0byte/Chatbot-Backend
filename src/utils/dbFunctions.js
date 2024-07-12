import { db, storage } from '../config/firebaseConfig.js';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPdfToFirebase(localPath, cloudPath) {
    try {
        const storageRef = ref(storage, cloudPath);
        const fileBuffer = fs.readFileSync(localPath);
        const metadata = {
            contentType: 'application/pdf',
        };
        await uploadBytes(storageRef, fileBuffer, metadata);
        const downloadURL = await getDownloadURL(storageRef);
        console.log(downloadURL);
        console.log('Uploaded a PDF file to Firebase Storage');
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
}

export async function storeProjectInfo(userID, cloudFilePath) {
    const projectId = uuidv4(); // Generate a random project ID

    try {
        const userProjectsRef = doc(db, 'projects', userID);
        const projectData = {
            id: projectId,
            cloudPath: cloudFilePath,
            status: 'uploaded'
        };

        await setDoc(userProjectsRef, { [projectId]: projectData }, { merge: true });

        console.log(`Project info stored: project_id=${projectId}, cloud_file_path=${cloudFilePath}`);
        return projectId
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
}

export const getAllProjects = async (userID) => {
    const userProjectsRef = doc(db, 'projects', userID);
    const userProjectsDoc = await getDoc(userProjectsRef);
    return userProjectsDoc;
}