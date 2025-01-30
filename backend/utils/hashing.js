// here we will hash the password

import bcrypt from 'bcrypt';

export async function hashPassword(password){
    try{
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    }catch(err){
        console.log("something went wrong this is the error",err);
    }
}

export async function comparePassword(password,hashedPassword){
    try{
        const isValid = await bcrypt.compare(password,hashedPassword);
        return isValid;
    }catch(err){
        console.log("Invalid password",err);
    }
}