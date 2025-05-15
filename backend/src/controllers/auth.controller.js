import { sql } from "../lib/sqlserver.js"; // chỉ cần sql, pool lấy qua dbSwitcher
import { createUser, getUserByUsername } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import Email from "../models/email.model.js";
import { getSqlPool } from "../lib/dbSwitcher.js";
//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";

export const signup = async (req, res) => {

  const { username, email, password } = req.body;
  const server = "server3";

  try {
    // Kiểm tra đầu vào
    console.log("Bắt đầu signup:", username, email, password, server);
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required (username, email, password)" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Kiểm tra email trong MongoDB
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Kết nối đúng SQL Server
    console.log("Đang lấy pool server:", server);

    // const pool = await getSqlPoolByServer(server);
    // if (!pool) {
    //   return res.status(500).json({ message: "Invalid server selection" });
    // }

    const pool = await getSqlPool();

    // Kiểm tra username trong server tương ứng
    console.log("Đang kiểm tra username:", username);

    const existingUser = await getUserByUsername(username, server);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists on this server" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user trên SQL Server
    console.log("Đang tạo user:", username);

    // Tạo user trong linked server
    const insertQuery = `
      INSERT INTO [${server}].chatty.dbo.Users (User_name, Password, Email)
      VALUES (@username, @password, @email)
    `;
    await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, hashedPassword)
      .input("email", sql.VarChar, email)
      .query(insertQuery);

    // Lấy lại user để lấy ID
    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query(`SELECT * FROM [${server}].chatty.dbo.Users WHERE Email = @email`);

    const user = result.recordset[0];

    // Lưu email vào MongoDB
    console.log("Đang lưu Email MongoDB:", email);

    await Email.create({
      userid: user.User_id.toString(),
      email,
      server
    });

    // Tạo JWT
    generateToken(user.Email, res);

    // Trả về thông tin
    res.status(201).json({
      id: user.User_id,
      username: user.User_name,
      email: user.Email,
      server,
      profilePic: user.ProfilePic || null
    });

  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // const servers = [1, 2, 3]; // Các server cần kiểm tra

    // 1. Tìm server từ MongoDB
    const emailRecord = await Email.findOne({ email });
    if (!emailRecord) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const server = emailRecord.server;
    const pool = await getSqlPool();

    console.log(server);
    const linkedServer = `${server}`; // ví dụ: server2
    const query = `
      SELECT * FROM [${linkedServer}].chatty.dbo.Users 
      WHERE Email = @email
    `;

    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query(query);

    const user = result.recordset[0];
    if (!user) {
      return res.status(400).json({ message: "User not found in SQL Server" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.Password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Tạo token và trả kết quả
    generateToken(user.Email, res);

    res.status(200).json({
      id: user.User_id,
      username: user.User_name,
      email: user.Email,
      server,
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
// Tạm thời chưa check hàm này
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user.id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const emailData = await Email.findOne({ userid: userId });
    if (!emailData) {
      return res.status(404).json({ message: "User not found in MongoDB" });
    }

    const pool = await getSqlPoolByServer(Number(emailData.server));

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
