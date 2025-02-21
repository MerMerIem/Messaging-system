// here we will handle the user's inputs within the database

import db from '../config/db.js';
import {hashPassword , comparePassword} from '../utils/hashing.js';
import createToken from '../utils/createToken.js';

export async function signup(req,res){
    // getting the inputs from the user
    const {email , password , username} = req.body;

    // querying the database
    try{
        // checkng if the user already exists
        const [user] = await db.query('SELECT * FROM user WHERE email = ?',[email]);

        if(user.length > 0){
           return res.status(400).json({message: 'User already exists'});
        }

        // if he doesn't exist we will insert him in the database
        // but first we need to hash the password
        const newPassword = await hashPassword(password);
        await db.query('INSERT INTO user (email,password,username) VALUES (?,?,?)',
                        [email,newPassword,username]
                      );

        // creating the token for the user 
        const [userRow] = await db.query('SELECT * FROM user WHERE email = ? AND password = ?',[email,newPassword]);
        const tokenData = {userId : userRow.user_id , email};
        const token = await createToken(tokenData);
        userRow.token = token;

         // giving a response back to user
            return res.status(200).json({ massage: 'User has been registered succussfully !',
                                          user: userRow,
                                          token: userRow.token
                                         });
    }catch(err){
        return res.status(500).json({message: 'error while registering user'});
    }
}

export async function login(req,res){
    try{
        // extracting the email and password from the request
        const {email,password} = req.body;

        // searching the user in the database that matches the email 
        const [user] = await db.query('SELECT * FROM user WHERE email = ?',[email]);
        if(user.length === 0){
            return res.status(500).json({message: 'user doesnt exist'});
        }
        console.log(user);
        // calling the function that compares the entered password and the password from db
        const matches = await comparePassword(password,user[0].password);
        if(!matches){
            return res.status(400).json({message: 'Uncorrect password'});
        }
        // creating the token for the user 
        const tokenData = {userId: user.user_id , email};
        const token = await createToken(tokenData);
        console.log("here's the token ",token);
        user.token = token;
        // giving a response to user
        return res.status(200).json({message: 'You have succussfully logged in !',
                            user:user,
                            token: token
                            });
    }catch(err){
        return res.status(400).json({message: 'Error while login'});
    }
}