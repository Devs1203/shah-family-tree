const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PASSKEY = 'BVN';
const DATA_FILE = path.join(__dirname, 'members.json');

app.use(express.json());

// Serve static files (index.html, etc.)
app.use(express.static(__dirname));

// GET all members
app.get('/api/members', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading members.json:', err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Verify passkey
app.post('/api/verify-passkey', (req, res) => {
    const { passkey } = req.body;
    if (passkey === PASSKEY) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid passkey' });
    }
});

// Update a member (passkey protected)
app.put('/api/members/:id', (req, res) => {
    const passkey = req.headers['x-passkey'];
    if (passkey !== PASSKEY) {
        return res.status(401).json({ error: 'Invalid passkey' });
    }

    const { id } = req.params;
    const { nameGuj, nameEn } = req.body;

    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const member = data.find(m => m.id === id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (nameGuj !== undefined) member.nameGuj = nameGuj;
        if (nameEn !== undefined) member.nameEn = nameEn;

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true, member });
    } catch (err) {
        console.error('Error updating member:', err);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

app.listen(PORT, () => {
    console.log(`🌳 Shah Family Tree server running at http://localhost:${PORT}`);
});
