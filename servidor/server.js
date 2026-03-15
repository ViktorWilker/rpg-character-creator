require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

const fichasRoutes = require('./routes/fichas');

// ------------------------------------------------
// INICIALIZAÇÃO DO EXPRESS
// ------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------
// CONEXÃO COM MONGODB
// ------------------------------------------------
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado!'))
    .catch(err => console.log('❌ Erro MongoDB:', err.message));

// ------------------------------------------------
// INICIALIZAÇÃO DO FIREBASE ADMIN
// ------------------------------------------------
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

// ------------------------------------------------
// MIDDLEWARE DE AUTENTICAÇÃO
// ------------------------------------------------
const autenticar = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
        
        const decoded = await admin.auth().verifyIdToken(token);
        req.userId = decoded.uid;
        next();
    } catch (err) {
        res.status(401).json({ erro: 'Token inválido' });
    }
};

// ------------------------------------------------
// ROTAS
// ------------------------------------------------
app.use('/fichas', autenticar, fichasRoutes);

// ------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR
// ------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
