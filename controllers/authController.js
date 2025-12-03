const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, email, name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      user: { id: user._id, email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.log("Error signing in", err);
    return res.status(500).json({ message: err.message });
  }
};
