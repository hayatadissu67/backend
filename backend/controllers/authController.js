import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

// ============================================================
// LOGIN
// ============================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // 2. Fetch the user from the database with role
        const user = await User.findOne({
            where: { email },
include: [{
    model: Role,
    as: "role",
    attributes: ["code", "name"],
}]        });

        // 3. Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // 4. Check account status
        if (user.get("status") !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is not active."
            });
        }

        // 5. Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.get("password")
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // 6. JWT secret check
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        // 7. Determine role code
        const roleCode = (user.role && user.role.code) 
            ? user.role.code 
            : (user.role && user.role.name) 
                ? user.role.name 
                : "TEAM_MEMBER";

        // 8. Create token
        const token = jwt.sign(
            {
                id: user.get("id"),
                email: user.get("email"),
                role: roleCode
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 9. Return success
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.get("id"),
                name: user.get("name"),
                email: user.get("email"),
                role: roleCode,
                status: user.get("status"),
                avatar: user.get("avatar")
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
};

// ============================================================
// REGISTER
// ============================================================
export const register = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "failed",
                message: "Email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                message: "Email already registered"
            });
        }

        // If roleId provided, ensure it exists
        if (roleId) {
            const role = await Role.findByPk(roleId);
            if (!role) {
                return res.status(400).json({
                    status: "failed",
                    message: "Invalid roleId"
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name || email.split('@')[0],
            email,
            password: hashedPassword,
            roleId: roleId || null,
            status: 'active'
        });

        // Remove password before returning
        const userSafe = user.toJSON();
        delete userSafe.password;

        // Generate token for immediate login
        const JWT_SECRET = process.env.JWT_SECRET;
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: "TEAM_MEMBER"
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            token,
            user: userSafe
        });
    } catch (error) {
        console.error("Error registering user:", error.message || error);
        return res.status(500).json({
            status: "failed",
            message: "Server Error"
        });
    }
};

// ============================================================
// GET CURRENT USER
// ============================================================
export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = req.user;
        const roleCode = (user.role && (user.role.code || user.role.name))
            ? (user.role.code || user.role.name)
            : 'TEAM_MEMBER';

        return res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: roleCode,
                status: user.status,
                avatar: user.avatar,
                assignedProjectCodes: user.assignedProjectCodes || []
            }
        });
    } catch (error) {
        console.error('getMe error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};