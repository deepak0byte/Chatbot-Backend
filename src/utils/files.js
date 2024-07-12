import fs from 'fs';
import path from 'path';

export const deleteFolder = (folderName) => {
    const folderPath = path.join('uploads', folderName);
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file, index) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
    console.log(`Folder ${folderPath} deleted successfully`);
};
