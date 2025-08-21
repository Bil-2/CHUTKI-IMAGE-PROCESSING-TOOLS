// controllers/authController.js
// Login user (test mode)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // ✅ Fake authentication for testing
    const fakeUser = { email };
    const fakeToken = "test-jwt-token";

    res.status(200).json({
      success: true,
      message: "Login successful (test mode)",
      token: fakeToken,
      user: fakeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Register user (test mode)
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // ✅ Simulate registration
    const fakeUser = { email };

    res.status(201).json({
      success: true,
      message: "User registered successfully (test mode)",
      user: fakeUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current logged-in user (test mode)
export const me = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Test user profile",
      user: { email: "test@example.com", name: "Test User" },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
