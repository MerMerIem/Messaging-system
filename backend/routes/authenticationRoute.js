import { Router } from "express";
import {signup,login} from '../controllers/authenticationController.js';
import { validateInputs } from '../middleware/authenticationMiddlware.js';

const router = Router();

router.post('/signup', validateInputs ,signup);
router.post('/login', validateInputs ,login);

export default router;