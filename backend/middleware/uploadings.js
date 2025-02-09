import multer from 'multer';
// this is used for simple cases where we don't need to keep the original file name
export const simpleUpload = multer({ dest: 'backend/uploads'}); 
// this is used if we need to  keep the original file name
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, 'backend/uploads');
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
});
export const upload = multer({storage});