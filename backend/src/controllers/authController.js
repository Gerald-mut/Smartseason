const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db'); // Assuming your db.js exports the supabase client

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    //check if email already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    //hash the password
    const password_hash = await bcrypt.hash(password, 10);

    //add the new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { name, email, password_hash, role: role || 'agent' }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: 'User created', userId: newUser.id });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //find user using their email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //compare password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //sign JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };