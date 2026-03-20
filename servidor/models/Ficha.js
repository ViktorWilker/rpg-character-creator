const mongoose = require('mongoose');

const FichaSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    lastSaved: { type: Date, default: Date.now },

    staticData: {
        maestery:        { type: Number, default: 5 },
        maesteryIndex:   { type: Number, default: 0 },
        peLimitPerRound: { type: Number, default: 1 },
        name:      { type: String, required: true },
        className: { type: String, required: true },
        origin:    { type: String, default: '' },
        age:       { type: Number, default: 25 },
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

        // Proficiências com grau: { nome: 'Luta', grau: 'treinado' | 'veterano' | 'expert' }
        proficiencies: {
            type: [{
                nome: { type: String, required: true },
                grau: { type: String, default: 'treinado', enum: ['treinado', 'veterano', 'expert'] }
            }],
            default: []
        },

        // Poder da origem
        originPoder:     { type: String, default: '' },
        originPoderDesc: { type: String, default: '' },
    },

    dynamicData: {
        pvAtual:   { type: Number, default: 0 },
        peAtual:   { type: Number, default: 0 },
        manaAtual: { type: Number, default: 0 },

        // Inventário como array de itens
        inventario: {
            type: [{
                id:        { type: String, required: true },
                nome:      { type: String, required: true },
                categoria: { type: String, default: 'item' }, // arma, proteção, item, consumível
                peso:      { type: Number, default: 0 },
                descricao: { type: String, default: '' }
            }],
            default: []
        },

        // Notas livres (campo de texto simples)
        notas: { type: String, default: '' },

        // Poderes desbloqueados em jogo (maestria, etc.)
        // Guardamos como array de { fonte, nome, descricao }
        podesDesbloqueados: {
            type: [{
                fonte:     { type: String, default: '' }, // 'origem', 'classe', 'maestria'
                nome:      { type: String, required: true },
                descricao: { type: String, default: '' }
            }],
            default: []
        }
    }
});

module.exports = mongoose.model('Ficha', FichaSchema);