import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignupRequest,LoginRequest } from '../types/interface';     
import supabase from '../db/supabase';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, role }: IUser = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          first_name,
          last_name,
          email,
          password_hash,
          role: role || 'student'
        }
      ])
      .select('id, first_name, last_name, email, role')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Error creating user'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, password_hash')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Remove password_hash from response
    delete user.password_hash;

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '1d'
  });
};
