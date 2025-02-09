import {Router} from 'express';
import {upload} from '../middleware/uploadings.js';

const router = Router();

router.post('/upload',upload.single('file'), (req, res)=>{
    console.log("recieved file",req.file);
    if(!req.file){
       return res.status(400).json({message:"No file uploaded"});
    }
    return res.status(200).json({
        message: "File uploaded successufully !",
        fileUrl: `/uploads/${req.file.filename}`
    });
});

export default router;