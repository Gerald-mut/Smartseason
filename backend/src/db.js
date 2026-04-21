const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

//create a supabase client instance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;