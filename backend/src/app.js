const express = require('express');
const cors = require('cors');
const { authenticate } = require('./middleware/auth');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['smartseason-7g5j2aja6-geralds-projects-e54ebd73.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'Smart Season api running'})
})

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/updates', require('./routes/updates'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port${PORT}`));
