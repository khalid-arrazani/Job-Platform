import express from 'express';
import user from '../models/User.js';
const router = express.Router();






router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.post('/register', (req, res) => {
    try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    const userExists = user.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new user({
        email,
        password,
        username
    });
   const user = newUser.save()

    res.status(201).json({ message: 'User registered successfully' },user);

}
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: 'Server error' });
    }
   
    
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // For demonstration purposes, we'll use hardcoded values
    if (email === 'user@example.com' && password === 'password123') {
        res.json({ message: 'Login successful!' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


export default router;