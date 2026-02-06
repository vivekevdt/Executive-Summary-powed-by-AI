import prisma from '../config/db.js';

export const createBusiness = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const business = await prisma.business.create({
            data: {
                name,
                description
            }
        });

        res.status(201).json(business);
    } catch (error) {
        console.error("Create Business Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await prisma.business.findMany({
            include: {
                _count: {
                    select: { users: true, reports: true }
                }
            }
        });
        res.json(businesses);
    } catch (error) {
        console.error("Get Businesses Error:", error);
        res.status(500).json({ error: error.message });
    }
};
