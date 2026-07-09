import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d" // token lasts 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return next(new Error("A user with this email address already exists"));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "Editor"
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400);
      return next(new Error("Invalid user registration data provided"));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if inputs exist
    if (!email || !password) {
      res.status(400);
      return next(new Error("Please provide email and password"));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  try {
    if (!["Admin", "Editor"].includes(role)) {
      res.status(400);
      return next(new Error("Invalid role selection. Must be Admin or Editor."));
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
