const mongoose = require('mongoose');

const FichaSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    lastSaved: {
        type: Date,
        default: Date.now
    },
    staticData: {
        maestery:        { type: Number, default: 5 },
        maesteryIndex:   { type: Number, default: 0 },
        peLimitPerRound: { type: Number, default: 1 },
        name: { type: String, required: true },
        className: { type: String, required: true },
        origin: { type: String, default: '' },
        age: { type: Number, default: 25 },
        attributes: {
            agi: { type: Number, default: 1 },
            str: { type: Number, default: 1 },
            int: { type: Number, default: 1 },
            pre: { type: Number, default: 1 },
            vig: { type: Number, default: 1 }
        },
        pvMax:   { type: Number, default: 0 },
        peMax:   { type: Number, default: 0 },
        manaMax: { type: Number, default: 0 },
        defesa:  { type: Number, default: 10 },
        proficiencies: { type: [String], default: [] }
    },
    dynamicData: {
        pvAtual:   { type: Number, default: 0 },
        peAtual:   { type: Number, default: 0 },
        manaAtual: { type: Number, default: 0 },
        inventario: { type: String, default: '' },
        pericias:   { type: String, default: '' }
    }
});

module.exports = mongoose.model('Ficha', FichaSchema);