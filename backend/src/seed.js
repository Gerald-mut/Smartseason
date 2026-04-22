const supabase = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  console.log('Seeding database...');

//clear existing data
  await supabase.from('field_updates').delete().neq('id', 0);
  await supabase.from('fields').delete().neq('id', 0);
  await supabase.from('users').delete().neq('id', 0);

  //create users
  const adminHash = await bcrypt.hash('admin123', 10);
  const agentHash = await bcrypt.hash('agent123', 10);

  const { data: admin, error: e1 } = await supabase.from('users').insert([
    { name: 'Alice Admin', email: 'alice@smartseason.com', password_hash: adminHash, role: 'admin' }
  ]).select().single();

  const { data: agent1, error: e2 } = await supabase.from('users').insert([
    { name: 'Bob Kamau', email: 'bob@smartseason.com', password_hash: agentHash, role: 'agent' }
  ]).select().single();

  const { data: agent2, error: e3 } = await supabase.from('users').insert([
    { name: 'Carol Wanjiku', email: 'carol@smartseason.com', password_hash: agentHash, role: 'agent' }
  ]).select().single();

  if (e1 || e2 || e3) throw new Error('User seeding failed');

  //Create fields
  const { data: fData, error: fErr } = await supabase.from('fields').insert([
    { name: 'Rift Valley Plot A', crop_type: 'Maize', planting_date: '2026-03-01', stage: 'Growing', assigned_agent_id: agent1.id, created_by: admin.id },
    { name: 'Nakuru Plot B', crop_type: 'Wheat', planting_date: '2026-02-15', stage: 'Ready', assigned_agent_id: agent1.id, created_by: admin.id },
    { name: 'Eldoret Farm C', crop_type: 'Beans', planting_date: '2026-01-20', stage: 'Harvested', assigned_agent_id: agent2.id, created_by: admin.id },
    { name: 'Kisumu Plot D', crop_type: 'Sorghum', planting_date: '2026-03-10', stage: 'Planted', assigned_agent_id: agent2.id, created_by: admin.id }
  ]).select();

  if (fErr) throw fErr;

  //create update history
  const { error: uErr } = await supabase.from('field_updates').insert([
    { field_id: fData[0].id, agent_id: agent1.id, stage: 'Growing', notes: 'Germination strong, no signs of pest damage.' },
    { field_id: fData[1].id, agent_id: agent1.id, stage: 'Ready', notes: 'Crop is ready for harvest. Awaiting coordinator confirmation.' },
    { field_id: fData[2].id, agent_id: agent2.id, stage: 'Harvested', notes: 'Full harvest completed. Yield above average.' },
    { field_id: fData[3].id, agent_id: agent2.id, stage: 'Planted', notes: 'Seeds planted. Waiting for first rains.' }
  ]);

  if (uErr) throw uErr;

  console.log('--- Seeding Complete ---');
  console.log('Admin → alice@smartseason.com / admin123');
  console.log('Agent → bob@smartseason.com / agent123');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});