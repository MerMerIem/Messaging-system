// here we will create the token

import jwt from 'jsonwebtoken';
import {config} from 'dotenv';
config();

async function createToken(tokenData,tokenKey = process.env.TOKEN_KEY,expiresIn = process.env.TOKEN_EXPIRES){
    try{
        const token = jwt.sign(tokenData,tokenKey,expiresIn);
        return token;
    }catch(err){
        console.log("error while creating the token",err);
    }
}

export default createToken;