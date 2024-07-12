import express from 'express';
import multer from 'multer';
import { getProjects, queryResponse, uploadPdf } from '../controllers/projectController.js';

const projectRouter = express.Router();

const upload = multer({ dest: 'docs/' });

projectRouter.post('/upload', upload.single('file'), uploadPdf);
projectRouter.get('/projects', getProjects);
projectRouter.post('/query', queryResponse);

export default projectRouter;