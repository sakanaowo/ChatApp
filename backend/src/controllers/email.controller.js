import Email from "../models/email.model.js";

// Kiểm tra xem email đã tồn tại chưa
export const checkEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const existingEmail = await Email.findOne({ email });

        if (existingEmail) {
            return res.status(200).json({ exists: true, message: "Email đã tồn tại." });
        }

        return res.status(200).json({ exists: false, message: "Email chưa tồn tại." });
    } catch (error) {
        console.error("Lỗi kiểm tra email:", error.message);
        res.status(500).json({ error: "Lỗi máy chủ" });
    }
};
