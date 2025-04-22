import { sql, poolPromise } from "../lib/sqlserver.js";
import { createUser, getUserByUsername } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Đăng ký
export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await createUser(username, hashedPassword, email);

    const user = await getUserByUsername(username);
    generateToken(user.User_id, res);

    res.status(201).json({
      id: user.User_id,
      username: user.User_name,
      email: user.Email,
      profilePic: user.ProfilePic || null
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.Password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.User_id, res);

    res.status(200).json({
      id: user.User_id,
      username: user.User_name,
      email: user.Email,
      profilePic: user.ProfilePic || null
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Đăng xuất
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cập nhật avatar
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user.id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const pool = await poolPromise;

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("profilePic", sql.VarChar, uploadResponse.secure_url)
      .query(`UPDATE Users SET ProfilePic = @profilePic WHERE User_id = @userId`);

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`SELECT * FROM Users WHERE User_id = @userId`);

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.log("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Kiểm tra xác thực
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
