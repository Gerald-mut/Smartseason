const express = require('express');
const cors = require('cors');
const { authenticate } = require('./middleware/auth');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'Smart Season api running'})
})

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/updates', require('./routes/updates'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port${PORT}`));
