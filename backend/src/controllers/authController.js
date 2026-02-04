
import jwt from 'jsonwebtoken';

const HARDCODED_EMAIL = 'admin@gmail.com';
const HARDCODED_PASSWORD = 'password';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
            const token = jwt.sign(
                { email: email, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    email: email,
                    role: 'admin'
                }
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
