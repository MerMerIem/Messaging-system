import path from 'path';
import fs from 'fs';

function downloadFile(req,res){
    console.log("decoded filename",req.params.filename);
    // constructing the file path according to the request and the root of the file
    const filePath = path.join(process.cwd(),'backend/uploads', req.params.filename);
    console.log("Current working directory:", process.cwd());
    console.log("file path here ",filePath);
    // checking if the filePath exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: "File not found" });
        }
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Error downloading file" });
            }
        });
    });    
}

export default downloadFile;