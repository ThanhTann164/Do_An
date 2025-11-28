const UserService = require("../services/user.service");

exports.getUserInfo = (req, res) => {
  if (req.session.loggedin) {
    res.json({
      success: true,
      user: {
        id: req.session.user_id,
        username: req.session.username,
        display_name: req.session.display_name || req.session.username,
        email: req.session.email,
        phone: req.session.phone,
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Not logged in",
    });
  }
};

exports.getPasswordRequirements = (req, res) => {
  res.json({
    success: true,
    requirements: {
      minLength: 8,
      mustContain: [
        "Ít nhất 1 chữ cái viết hoa (A-Z)",
        "Ít nhất 1 chữ cái viết thường (a-z)",
        "Ít nhất 1 chữ số (0-9)",
      ],
      examples: ["MyPass123", "SecureKey456", "StrongPwd789"],
    },
  });
};

exports.register = async (req, res) => {
  try {
    const userId = await UserService.register(req.body);
    res.status(201).json({ success: true, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserService.login(username, password);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.loggedin = true;
    req.session.user_id = user.user_id;
    req.session.username = user.username;
    req.session.display_name = user.display_name;
    req.session.email = user.email;
    req.session.phone = user.phone;

    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    await UserService.changePassword(username, newPassword);
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    await UserService.updateProfile(username, email, phone);
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateDisplayName = async (req, res) => {
  try {
    const { userId, displayName } = req.body;
    await UserService.updateDisplayName(userId, displayName);
    res.json({ success: true, message: "Display name updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await UserService.getAllSellers();
    res.json({ success: true, data: sellers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await UserService.getAllBuyers();
    res.json({ success: true, data: buyers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
