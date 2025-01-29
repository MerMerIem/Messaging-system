import express from 'express';
const router = express.Router();

router.post('/signup',async(req,res)=>{
    //getting the user's inputs and validate them
    const {email,password} = req.body;
    // Check if the inputs are valid
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required!' });
    }
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    //check if the email already exists in the database
});

export default router;