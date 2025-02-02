// verify the token

import jwt from 'jsonwebtoken';
import {config} from 'dotenv';
import {body,validationResult} from 'express-validator';
config();
const TOKEN_KEY = process.env.TOKEN_KEY;

export const verifyToken = (req,res,next)=>{
    console.log("called");
    // get the token from the header of the request
    const token = req.headers['x-api-key'] && req.headers['x-api-key'].split(' ')[1];

    // check if the token est valide 
    if(!token){
        return res.status(403).json({message:"there is not any token"});
    }

    try{
        const decodedToken = jwt.verify(token,TOKEN_KEY);
        req.currentUser = decodedToken;
        next();
    }catch(err){
        res.status(400).json({message: 'Invalid token'});
    }

}

export async function validateInputs(req, res, next) {
    const validations = [];

    if (req.path === '/login') {
        validations.push(
            body('email').isEmail().withMessage('Invalid email').run(req),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req)
        );
    } else if (req.path === '/signup') {
        validations.push(
            body('email').isEmail().withMessage('Invalid email').run(req),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req),
            body('username').notEmpty().withMessage('User name is required').run(req)
        );
    }
    await Promise.all(validations);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}