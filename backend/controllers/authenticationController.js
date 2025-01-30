// here we will handle the user's inputs within the database

import db from '../config/db.js';
import {body,validationResult} from 'express-validator';
import {hashPassword , comparePassword} from '../utils/hashing.js';
import createToken from '../utils/createToken.js';

export async function signup(req,res){
    // getting the inputs from the user
    const {email , password} = req.body;

    // validating the inputs
    body('email').isEmail.withMessage('Invalid email');
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long');
    const errors = validationResult(req);
    if(!errors.isEmpty){
        res.status(400).json({errors: errors.array});
    }
    // querying the database
    try{
        // checkng if the user already exists
        const user = await db.query('select * from user where email = ?',email);

        if(user){
            res.status(400).json({message: 'User already exists'});
        }

        // if he doesn't exist we will insert him in the database
        // but first we need to hash the password
        const newPassword = hashPassword(password);
        await db.query('insert into user (email,password) values (?,?)',
                        [email,newPassword]
                      );

        // creating the token for the user 
        const userRow = await db.query('select * from user where email = ? and password = ?',email,password);
        const tokenData = {userId : userRow.user_id , email};
        const token = await createToken(tokenData);
        userRow.token = token;

         // giving a response back to user
            res.status(200).json({ massage: 'User has been registered succussfully !',
                                   user: userRow,
                                   token
                                 });
    }catch(err){
        res.status(500).json({message: 'error while registering user'});
        console.log("error is ",err);
    }
}

export async function login(req,res){
    try{
        // extracting the email and password from the request
    const {email,password} = req.body;

    // check if the inputs are valid
    body('email').isEmail.withMessage('Invalid email');
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long');
    const errors = validationResult(req);
    if(!errors.isEmpty){
        res.status(400).json({errors: errors.array});
    }

    // searching the user in the database that matches the email 
    const user = await db.query('select * from user where email = ?',email);
    if(!user){
        res.status(500).json({message: 'user doesnt exist'});
    }
    // calling the function that compares the entered password and the password from db
    const matches = await comparePassword(password,user.password);
    if(!matches){
        res.status(400).json({message: 'Uncorrect password'});
    }
    // creating the token for the user 
    const tokenData = {userId: user.user_id , email};
    const token = createToken(tokenData);
    user.token = token;
    // giving a response to user
    res.status(200).json({message: 'You have succussfully logged in !',
                          user:user,
                          token
                         });
    }catch(err){
        res.status(400).json({message: 'Error while login'});
    }
}