const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();


class UserController {

    //[get] /login
    indexLogin(req, res) {
        res.render('login', { title: 'Đăng nhập', layout: 'auth' });
    }

    //[post] /login
    async login(req, res) {
        const { email, password } = req.body;

        try {
            // Kiểm tra user có tồn tại không
            const user = await User.findOne({ where: { email } });
            if (!user) return res.render("login", { error: "Tài khoản không tồn tại", layout: 'auth' });

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.render("login", { error: "Sai mật khẩu", email, layout: 'auth' });

            // Tạo JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES, }
            );

            // Gửi token về client (lưu vào cookie)
            res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            //return res.render('home', { user: user.toJSON() });
            return res.redirect('/');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    //[get] /register
    indexRegister(req, res) {
        res.render('register', { title: 'Đăng ký', layout: 'auth' });
    }

    //[post] /register
    async register(req, res) {
        const { name, email, password, repassword } = req.body;

        // Kiểm tra nhập lại mật khẩu
        if (password !== repassword) {
            return res.render("register", { error: "Mật khẩu nhập không khớp", name, email, layout: 'auth' });
        }

        try {
            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.render("register", { error: "Email đã tồn tại", name, email, layout: 'auth' });
            }

            // Mã hóa mật khẩu
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS)
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Tạo user mới
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword, // Lưu mật khẩu đã mã hóa
            });

            return res.redirect('/login?success=1');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    //[get] /logout
    logout(req, res) {
        res.clearCookie('token');
        res.redirect('/');
    }

    //[get] /profile
    async profile(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            let successMessage = "";
            if (req.query.success === "1") successMessage = "Cập nhật thông tin thành công!";
            if (req.query.success === "2") successMessage = "Đổi mật khẩu thành công!";

            res.render("profile/show", { user: user.toJSON(), successMessage });
        } catch (error) {
            console.error(error);
            res.status(500).send("Lỗi server");
        }
    }

    //[get] /profile/update
    async showProfileUpdate(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            res.render("profile/update", { user: user.toJSON(), layout: 'main' });
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Lỗi server");
        }
    }

    //[post] /profile
    async updateProfile(req, res) {
        const { name, phone, address } = req.body;
        try {
            await User.update(
                { name, phone, address },
                { where: { id: req.user.id } }
            );
            res.redirect("/profile?success=1");
        } catch (error) {
            console.error(error);
            res.status(500).send("Lỗi server");
        }
    }

    //[get] /profile/change-password
    showChangePassword(req, res) {
        res.render("profile/changePass", { layout: 'main' });
    }

    //[post] /profile/change-password
    async changePassword(req, res) {
        const { oldpass, newpass, renewpass } = req.body;
        try {
            const user = await User.findByPk(req.user.id);
            const isMatch = await bcrypt.compare(oldpass, user.password);
            if (!isMatch) {
                return res.render("profile/changePass", { error: "Mật khẩu cũ không đúng"});
            }

            if (newpass !== renewpass) {
                return res.render("profile/changePass", { error: "Mật khẩu nhập lại không khớp" });
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(newpass, saltRounds);

            await User.update(
                { password: hashedPassword },
                { where: { id: req.user.id } }
            );

            res.redirect("/profile?success=2");
        } catch (error) {
            console.error(error);
            res.status(500).send("Lỗi server");
        }
    }
}

module.exports = new UserController();