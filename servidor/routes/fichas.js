const express = require('express');
const router = express.Router();
const Ficha = require('../models/Ficha');

// ------------------------------------------------
// GET /fichas — busca todas as fichas do usuário
// ------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const fichas = await Ficha.find({ userId: req.userId });
        res.json(fichas);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ------------------------------------------------
// GET /fichas/:id — busca uma ficha específica
// ------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const ficha = await Ficha.findOne({ 
            _id: req.params.id, 
            userId: req.userId 
        });
        if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
        res.json(ficha);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ------------------------------------------------
// POST /fichas — cria uma ficha nova
// ------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const ficha = new Ficha({
            userId: req.userId,
            staticData: req.body.staticData,
            dynamicData: req.body.dynamicData
        });
        const fichaSalva = await ficha.save();
        res.status(201).json(fichaSalva);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// ------------------------------------------------
// PUT /fichas/:id — atualiza dynamicData (estado de jogo)
// ------------------------------------------------
router.put('/:id', async (req, res) => {
    try {
        const ficha = await Ficha.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { 
                dynamicData: req.body.dynamicData,
                lastSaved: Date.now()
            },
            { new: true }
        );
        if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
        res.json(ficha);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// ------------------------------------------------
// DELETE /fichas/:id — deleta uma ficha
// ------------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const ficha = await Ficha.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.userId 
        });
        if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
        res.json({ mensagem: 'Ficha deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;
