
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/authModel/userModel.js";

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
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare password (supports bcrypt hashes and fallback string matching)
        const storedPassword = user.get("password") || user.password || "";
        let passwordMatch = false;
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            passwordMatch = await bcrypt.compare(password, storedPassword);
        } else {
            passwordMatch = (password === storedPassword) || (await bcrypt.compare(password, storedPassword).catch(() => false));
        }

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // JWT secret fallback
        const JWT_SECRET = process.env.JWT_SECRET || "pmo_default_secret_key_2026";

        const userStatus = user.get("status") || user.status || "Active";
        if (String(userStatus).toLowerCase() === "inactive" || String(userStatus).toLowerCase() === "disabled") {
            return res.status(403).json({
                success: false,
                message: "Your account is not active."
            });
        }

        const roleCode = (user.role && typeof user.role === 'object') 
            ? (user.role.code || user.role.name || "TEAM_MEMBER") 
            : (user.get("role") || user.role || "TEAM_MEMBER");

        // Create token
        const token = jwt.sign(
            {
                id: user.get("id") || user.id,
                email: user.get("email") || user.email,
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
                id: user.get("id") || user.id,
                name: user.get("name") || user.name,
                email: user.get("email") || user.email,
                role: roleCode,
                department: user.get("department") || user.department,
                status: userStatus,
                avatar: user.get("avatar") || user.avatar
            }
        });

    } catch (error) {
        console.error("Login error:", error.message || error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error during login."
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
