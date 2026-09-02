
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user
        const user = await User.findOne({
            where: { email },
            include: ['role']
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check account status
        if (user.get("status") !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your account is not active."
            });
        }

        // Compare password
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

        // JWT secret
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const roleCode = (user.role && user.role.code) ? user.role.code : "TEAM_MEMBER";

        // Create token
        const token = jwt.sign(
            {
                id: user.get("id"),
                email: user.get("email"),
                role: roleCode
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.get("id"),
                name: user.get("name"),
                email: user.get("email"),
                role: roleCode,
                department: user.get("department"),
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

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    // Create user (await is required)
    const user = await User.create({
      name,
      email,
      password, 
      role,
      department,
    });

    // Respond with success
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: user,
    });

  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      status: "failed",
      message: "Server Error",
    });
  }
};
