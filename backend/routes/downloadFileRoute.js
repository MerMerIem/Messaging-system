import {Router} from 'express';
import downloadFile from '../controllers/downloadFileController.js';

const router = Router();

router.get('/:filename', downloadFile);

export default router;