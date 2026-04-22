const supabase = require('../db');

const addUpdate = async (req, res) => {
  const { field_id, stage, notes } = req.body;

  try {
    //if agent verify this field is actually assigned to them
    if (req.user.role === 'agent') {
      const { data: field, error: accessError } = await supabase
        .from('fields')
        .select('id')
        .eq('id', field_id)
        .eq('assigned_agent_id', req.user.id)
        .single();

      if (accessError || !field) {
        return res.status(403).json({ message: 'Field not assigned to you' });
      }
    }

    //log the update in field_updates table
    const { error: logError } = await supabase
      .from('field_updates')
      .insert([
        { 
          field_id, 
          agent_id: req.user.id, 
          stage, 
          notes: notes || null 
        }
      ]);

    if (logError) throw logError;

    // advance the field's current stage in the fields table
    const { error: updateError } = await supabase
      .from('fields')
      .update({ stage })
      .eq('id', field_id);

    if (updateError) throw updateError;

    res.status(201).json({ message: 'Field updated successfully' });
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFieldUpdates = async (req, res) => {
  const { field_id } = req.params;

  try {
    //if agent, verify access
    if (req.user.role === 'agent') {
      const { data: field, error: accessError } = await supabase
        .from('fields')
        .select('id')
        .eq('id', field_id)
        .eq('assigned_agent_id', req.user.id)
        .single();

      if (accessError || !field) {
        return res.status(403).json({ message: 'Field not assigned to you' });
      }
    }

    //get history with agent names
    const { data: updates, error: fetchError } = await supabase
      .from('field_updates')
      .select(`
        *,
        agent:agent_id ( name )
      `)
      .eq('field_id', field_id)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    //flatten agent name for cleaner JSON response
    const formattedUpdates = updates.map(u => ({
      ...u,
      agent_name: u.agent?.name
    }));

    res.json(formattedUpdates);
  } catch (err) {
    console.error('Fetch Updates Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addUpdate, getFieldUpdates };