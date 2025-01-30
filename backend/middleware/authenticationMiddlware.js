// verify the token

import jwt from 'jsonwebtoken';
import {TOKEN_KEY} from 'dotenv';

const verifyToken = (req,res,next)=>{
    // get the token from the header of the request
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

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

export default verifyToken;