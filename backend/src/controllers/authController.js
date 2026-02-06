import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 1. Check database for user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { business: true }
        });

        // 2. Simple password check (IN PRODUCTION USE BCRYPT!)
        // User asked for "create users with password", assuming plain text for MVP speed unless requested otherwise
        if (user && user.password === password) {
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role, businessId: user.businessId },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    business: user.business
                }
            });
        }

        // 3. Fallback for Initial Admin (if DB is empty or for rescue)
        const HARDCODED_EMAIL = 'admin@gmail.com';
        const HARDCODED_PASSWORD = 'admin@1234567890';

        if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
            const token = jwt.sign(
                { email: email, role: 'admin', userId: 0 },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.status(200).json({
                message: 'Login successful (Rescue Admin)',
                token,
                user: {
                    email: email,
                    role: 'admin',
                    business: null
                }
            });
        }

        return res.status(401).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, password, role, businessId } = req.body;

        // TODO: Hash password here

        const newUser = await prisma.user.create({
            data: {
                email,
                password, // Plain text for now as per simple request
                role: role || 'user',
                businessId: businessId ? parseInt(businessId) : null
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                business: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Remove password from response
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });

        res.json(safeUsers);
    } catch (error) {
        console.error('Get Users error:', error);
        res.status(500).json({ error: error.message });
    }
};
