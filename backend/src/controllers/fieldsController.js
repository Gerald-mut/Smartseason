const supabase = require('../db');

//compute status based on business logic
const computeStatus = (field) => {
  if (field.stage === 'Harvested') return 'Completed';
  
  //calculate days since last update
  const lastUpdate = new Date(field.last_updated_at);
  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / 86400000;
  
  if (daysSinceUpdate > 7) return 'At Risk';
  return 'Active';
};

const getAllFields = async (req, res) => {
  try {
    //get all fields and the name from the related 'users' table
    const { data: fields, error } = await supabase
      .from('fields')
      .select(`
        *,
        agent:assigned_agent_id ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const withStatus = fields.map(f => ({ 
      ...f, 
      agent_name: f.agent?.name || 'Unassigned',
      status: computeStatus(f) 
    }));
    
    res.json(withStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyFields = async (req, res) => {
  try {
    const { data: fields, error } = await supabase
      .from('fields')
      .select(`
        *,
        agent:assigned_agent_id ( name )
      `)
      .eq('assigned_agent_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const withStatus = fields.map(f => ({ 
      ...f, 
      agent_name: f.agent?.name,
      status: computeStatus(f) 
    }));
    
    res.json(withStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const createField = async (req, res) => {
  const { name, crop_type, planting_date, assigned_agent_id } = req.body;

  try {
    const { data, error } = await supabase
      .from('fields')
      .insert([
        { 
          name, 
          crop_type, 
          planting_date, 
          assigned_agent_id: assigned_agent_id || null, 
          created_by: req.user.id 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Field created', fieldId: data.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateField = async (req, res) => {
  const { id } = req.params;
  const { name, crop_type, planting_date, assigned_agent_id } = req.body;

  try {
    const { error } = await supabase
      .from('fields')
      .update({ 
        name, 
        crop_type, 
        planting_date, 
        assigned_agent_id: assigned_agent_id || null 
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Field updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAgents = async (req, res) => {
  try {
    const { data: agents, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'agent');

    if (error) throw error;
    res.json(agents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboard = async (req, res) => {
  try {
    let query = supabase.from('fields').select('*');

    // Role-based filtering
    if (req.user.role !== 'admin') {
      query = query.eq('assigned_agent_id', req.user.id);
    }

    const { data: fields, error } = await query;
    if (error) throw error;

    const withStatus = fields.map(f => ({ ...f, status: computeStatus(f) }));

    const summary = {
      total: withStatus.length,
      active: withStatus.filter(f => f.status === 'Active').length,
      at_risk: withStatus.filter(f => f.status === 'At Risk').length,
      completed: withStatus.filter(f => f.status === 'Completed').length,
    };

    res.json({ summary, fields: withStatus });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllFields, getMyFields, createField, updateField, getAgents, getDashboard };