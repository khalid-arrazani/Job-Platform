import express from 'express';
import User from '../models/User.js';
import { validateUserRegistration } from '../models/User.js';
const router = express.Router();
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';






router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.post('/register',asyncHandler(async(req, res) => {
   
    const { email, password, username } = req.body;

    const { error } = validateUserRegistration({ email, password, username });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }


    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
        email,
        password: hashedPassword,
        username
    });
  const savedUser = await newUser.save();

    const userObj = savedUser.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
}));

router.post('/login',asyncHandler(async (req, res) => {
    
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }


    res.json({ message: 'Login successful!' });
}));

export default router;