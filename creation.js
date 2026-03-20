// =============================================
// DADOS DO SISTEMA
// =============================================
const PROFICIENCIAS = [
    'Acrobacia','Adestramento','Arcano','Artes','Atletismo','Atualidades',
    'Ciências','Crime','Diplomacia','Enganação','Fortitude','Furtividade',
    'Iniciativa','Intimidação','Intuição','Investigação','Luta','Medicina',
    'Ocultismo','Percepção','Pilotagem','Pontaria','Profissão','Reflexos',
    'Religião','Sobrevivência','Tática','Tecnologia','Vontade'
];

const CLASS_PROF_RULES = {
    Combatente: {
        choices:  [
            { label: 'Combate', options: ['Luta', 'Pontaria'] },
            { label: 'Resistência', options: ['Fortitude', 'Reflexos'] }
        ],
        fixed:    [],
        freeBase: 1
    },
    Especialista: {
        choices:  [],
        fixed:    [],
        freeBase: 7
    },
    Ocultista: {
        choices:  [],
        fixed:    ['Ocultismo', 'Vontade'],
        freeBase: 3
    }
};

const CLASS_BASES = {
    Combatente:   { pvBase: 20, peBase: 6,  manaBase: 0 },
    Especialista: { pvBase: 16, peBase: 8,  manaBase: 0 },
    Ocultista:    { pvBase: 12, peBase: 4,  manaBase: 8 }
};

// Ganho de stats por nível por classe
// Fórmula: base + atributo (calculado em tempo real)
const CLASS_LEVEL_BASE = {
    Combatente:   { pv: 4, pe: 5, mana: 2 },
    Especialista: { pv: 3, pe: 4, mana: 3 },
    Ocultista:    { pv: 2, pe: 3, mana: 5 }
};

const MAESTERY_LEVELS = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99];

// Índices que concedem aumento de atributo (20%=3, 50%=9, 80%=15, 95%=18)
const ATTR_BONUS_INDEXES = [3, 9, 15, 18];

// Índices que concedem Grau de Treinamento (35%=6, 70%=13)
const GRAU_TREINAMENTO_INDEXES = [6, 13];

const ORIGIN_PERICIAS = {
    'Erudito Arcano':              ['Arcano', 'Investigação'],
    'Curandeiro de Aldeia':        ['Intuição', 'Medicina'],
    'Amnésico':                    [],
    'Bardo Errante':               ['Artes', 'Enganação'],
    'Gladiador':                   ['Acrobacia', 'Atletismo'],
    'Alquimista de Ervas':         ['Fortitude', 'Profissão'],
    'Ladrão de Ruínas':            ['Crime', 'Furtividade'],
    'Ex-Iniciado das Trevas':      ['Arcano', 'Religião'],
    'Sobrevivente das Terras Vazias': ['Fortitude', 'Sobrevivência'],
    'Artífice Mecânico':           ['Profissão', 'Tecnologia'],
    'Mercador Astuto':             ['Diplomacia', 'Profissão'],
    'Caçador de Segredos':         ['Investigação', 'Percepção'],
    'Brutamontes':                 ['Luta', 'Reflexos'],
    'Patrono Misterioso':          ['Diplomacia', 'Pilotagem'],
    'Mercenário':                  ['Iniciativa', 'Intimidação'],
    'Soldado Veterano':            ['Pontaria', 'Tática'],
    'Mineiro das Profundezas':     ['Fortitude', 'Profissão'],
    'Guarda da Cidade':            ['Percepção', 'Pontaria'],
    'Sacerdote':                   ['Religião', 'Vontade'],
    'Escriba do Conselho':         ['Intuição', 'Vontade'],
    'Profeta de Ruínas':           ['Investigação', 'Arcano'],
    'Tecnoarqueólogo':             ['Investigação', 'Tecnologia'],
    'Camponês Errante':            ['Adestramento', 'Sobrevivência'],
    'Charlatão':                   ['Crime', 'Enganação'],
    'Aprendiz de Academia Arcana': ['Atualidades', 'Investigação'],
    'Sobrevivente das Trevas':     ['Reflexos', 'Vontade'],
};

// =============================================
// ESTADO DA CRIAÇÃO
// =============================================
let attrs         = { agi:1, str:1, int:1, pre:1, vig:1 };
let totalPoints   = 4;
let selectedClass = 'Combatente';
let maesteryIndex = 0; // índice atual do slider (0 = 5%)

// Proficiências
let choiceSelections  = {}; // { groupKey: 'NomeEscolhido' }
// groupKey é string pra suportar tanto choices de classe ('class-0') quanto de maestria ('maestery-6')
let freeSelectedProfs = [];
let originLockedProfs = [];

// =============================================
// CÁLCULO DE STATS COM MAESTRIA
// Recalcula do zero com base no índice atual
// =============================================
function calcStatsForIndex(index) {
    const b    = CLASS_BASES[selectedClass];
    const lvl  = CLASS_LEVEL_BASE[selectedClass];

    // Stats base (nível 5% = índice 0)
    let pv   = b.pvBase   + attrs.vig;
    let pe   = b.peBase   + Math.floor((attrs.vig + attrs.agi) / 2);
    let mana = b.manaBase + Math.floor((attrs.int + attrs.pre) / 2);

    // Acumula ups do índice 1 até index
    for (let i = 1; i <= index; i++) {
        pv   += lvl.pv   + attrs.vig;
        pe   += lvl.pe   + Math.floor((attrs.vig + attrs.agi) / 2);
        mana += lvl.mana + Math.floor((attrs.int + attrs.pre) / 2);
    }

    return { pv, pe, mana };
}

// Conta quantos pontos de atributo extra foram ganhos até o índice
function countAttrBonuses(index) {
    return ATTR_BONUS_INDEXES.filter(i => i <= index).length;
}

// Conta quantos Graus de Treinamento foram ganhos até o índice
function countGrauTreinamento(index) {
    return GRAU_TREINAMENTO_INDEXES.filter(i => i <= index).length;
}

// =============================================
// ATUALIZA PREVIEW DE STATS
// =============================================
function updateStats() {
    const stats = calcStatsForIndex(maesteryIndex);
    document.getElementById('statPv').textContent   = stats.pv;
    document.getElementById('statPe').textContent   = stats.pe;
    document.getElementById('statMana').textContent = stats.mana;
}

// =============================================
// MAESTRIA — slider onChange
// =============================================
function updateMaesteryDisplay(index) {
    maesteryIndex = parseInt(index);
    totalPoints = 4 + countAttrBonuses(maesteryIndex);
    document.getElementById('pointsLeft').textContent = totalPoints - getPointsUsed();
    document.getElementById('maestery-display').textContent = MAESTERY_LEVELS[maesteryIndex] + '%';

    // Mostra habilidade do nível via WASM se disponível
    if (typeof Module !== 'undefined' && Module.Combatente_GetSkill) {
        let skill = '';
        if (selectedClass === 'Combatente')   skill = Module.Combatente_GetSkill(maesteryIndex);
        if (selectedClass === 'Especialista') skill = Module.Especialista_GetSkill(maesteryIndex);
        if (selectedClass === 'Ocultista')    skill = Module.Ocultista_GetSkill(maesteryIndex);
        document.getElementById('maestery-skill-display').textContent = skill;
    }

    // Atualiza stats no preview
    updateStats();

    // Mostra bônus acumulados
    updateMaesteryBonusInfo();

    // Reconstrói choices (pode ter desbloqueado Grau de Treinamento)
    buildChoicesSection();
    updateProfCounter();
}

function updateMaesteryBonusInfo() {
    const attrBonuses = countAttrBonuses(maesteryIndex);
    const graus       = countGrauTreinamento(maesteryIndex);

    let infoEl = document.getElementById('maestery-bonus-info');
    if (!infoEl) {
        infoEl = document.createElement('div');
        infoEl.id = 'maestery-bonus-info';
        infoEl.style.cssText = 'margin-top:0.6rem;display:flex;flex-wrap:wrap;gap:0.5rem;';
        document.getElementById('maestery-skill-display').after(infoEl);
    }

    const badges = [];
    if (attrBonuses > 0) {
        badges.push(`<span style="font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.08em;
            padding:0.25rem 0.6rem;border:1px solid var(--gold-dim);color:var(--gold);background:var(--gold-pale);">
            +${attrBonuses} ponto${attrBonuses > 1 ? 's' : ''} de atributo acumulado${attrBonuses > 1 ? 's' : ''}
        </span>`);
    }
    if (graus > 0) {
        badges.push(`<span style="font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.08em;
            padding:0.25rem 0.6rem;border:1px solid var(--purple-light);color:var(--purple-light);background:rgba(90,58,138,0.1);">
            ${graus} Grau${graus > 1 ? 's' : ''} de Treinamento
        </span>`);
    }
    infoEl.innerHTML = badges.join('');
}

// =============================================
// SEÇÃO DE CHOICES (classe + maestria)
// =============================================
function buildChoicesSection() {
    const rules     = CLASS_PROF_RULES[selectedClass];
    const container = document.getElementById('profChoices');
    container.innerHTML = '';

    // Grupos de escolha da classe
    const allGroups = [];
    rules.choices.forEach((group, idx) => {
        allGroups.push({ key: `class-${idx}`, label: group.label, options: group.options });
    });

    if (allGroups.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    allGroups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.className = 'op-prof-choice-group';

        const labelEl = document.createElement('div');
        labelEl.className = 'op-prof-choice-label';
        labelEl.textContent = group.isGrau
            ? group.label
            : `Escolha uma — ${group.label}`;
        groupEl.appendChild(labelEl);

        const optionsEl = document.createElement('div');
        optionsEl.className = 'op-prof-choice-options';

        // Grau de Treinamento usa select pra não poluir com 29 botões
        if (group.isGrau) {
            const sel = document.createElement('select');
            sel.className = 'op-select';
            sel.style.maxWidth = '260px';
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Selecione uma perícia...';
            sel.appendChild(placeholder);
            group.options.forEach(opt => {
                const op = document.createElement('option');
                op.value = opt;
                op.textContent = opt;
                if (choiceSelections[group.key] === opt) op.selected = true;
                sel.appendChild(op);
            });
            sel.onchange = () => {
                choiceSelections[group.key] = sel.value || undefined;
                buildProfGrid();
                updateProfCounter();
            };
            optionsEl.appendChild(sel);
        } else {
            group.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'op-prof-choice-btn' + (choiceSelections[group.key] === opt ? ' selected' : '');
                btn.textContent = opt;
                btn.onclick = () => selectChoice(group.key, opt);
                optionsEl.appendChild(btn);
            });
        }

        groupEl.appendChild(optionsEl);
        container.appendChild(groupEl);
    });
}

function selectChoice(groupKey, option) {
    choiceSelections[groupKey] = option;
    buildChoicesSection();
    buildProfGrid();
    updateProfCounter();
}

// =============================================
// GRADE DE PROFICIÊNCIAS LIVRES
// =============================================
function buildProfGrid() {
    const grid = document.getElementById('profGrid');
    grid.innerHTML = '';

    const allChosen = [
        ...CLASS_PROF_RULES[selectedClass].fixed,
        ...Object.values(choiceSelections).filter(Boolean),
        ...originLockedProfs
    ];
    freeSelectedProfs = freeSelectedProfs.filter(p => !allChosen.includes(p));

    PROFICIENCIAS.forEach(p => {
        const el        = document.createElement('div');
        const isLocked  = CLASS_PROF_RULES[selectedClass].fixed.includes(p) || originLockedProfs.includes(p);
        const isChoice  = Object.values(choiceSelections).includes(p);
        const isFree    = freeSelectedProfs.includes(p);

        if (isLocked || isChoice) {
            el.className = 'op-prof-tag locked';
            el.title     = isLocked ? 'Perícia fixa — não pode ser removida' : 'Perícia escolhida acima';
        } else {
            el.className = 'op-prof-tag' + (isFree ? ' selected' : '');
            el.onclick   = () => toggleFreeProf(p, el);
        }
        el.textContent = p;
        grid.appendChild(el);
    });
}

function toggleFreeProf(p, el) {
    if (freeSelectedProfs.includes(p)) {
        freeSelectedProfs = freeSelectedProfs.filter(x => x !== p);
        el.classList.remove('selected');
    } else {
        if (freeSelectedProfs.length >= getTotalFreeProfs()) return;
        freeSelectedProfs.push(p);
        el.classList.add('selected');
    }
    updateProfCounter();
}

function getTotalFreeProfs() {
    const graus = countGrauTreinamento(maesteryIndex);
    // Cada grau = 2 + INT perícias extras (regra do sistema)
    const extrasDeGrau = graus * (2 + attrs.int);
    return CLASS_PROF_RULES[selectedClass].freeBase + attrs.int + extrasDeGrau;
}

function updateProfCounter() {
    document.getElementById('maxProf').textContent       = getTotalFreeProfs();
    document.getElementById('freeProfsUsed').textContent = freeSelectedProfs.length;
}

// =============================================
// SELEÇÃO DE CLASSE
// =============================================
function selectClass(el) {
    document.querySelectorAll('.op-class-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedClass     = el.dataset.class;
    choiceSelections  = {};
    freeSelectedProfs = [];
    buildChoicesSection();
    buildProfGrid();
    updateProfCounter();
    updateStats();
    updateMaesteryDisplay(maesteryIndex);
}

// =============================================
// ORIGEM
// =============================================
function onOriginChange() {
    const val         = document.getElementById('create-origin').value;
    originLockedProfs = ORIGIN_PERICIAS[val] || [];
    freeSelectedProfs = freeSelectedProfs.filter(p => !originLockedProfs.includes(p));
    buildChoicesSection();
    buildProfGrid();
    updateProfCounter();
}

// =============================================
// ATRIBUTOS
// =============================================
function changeAttr(key, delta) {
    const newVal = attrs[key] + delta;
    const maxAttr = totalPoints > 4 ? 5 : 3;
    if (newVal < 0 || newVal > maxAttr) return;
    if (delta > 0 && getPointsUsed() >= totalPoints) return;
    attrs[key] = newVal;
    document.getElementById('val-' + key).textContent = newVal;
    document.getElementById('pointsLeft').textContent = totalPoints - getPointsUsed();
    updateStats();
    updateProfCounter();
    buildProfGrid();
}

function getPointsUsed() {
    return Object.values(attrs).reduce((a, b) => a + b, 0) - 5;
}

// =============================================
// HELPER — todas as proficiências selecionadas
// Usado pelo setup.js no saveNewCharacter
// =============================================
function getAllSelectedProfs() {
    const all = [];
    CLASS_PROF_RULES[selectedClass].fixed.forEach(p => all.push(p));
    Object.values(choiceSelections).filter(Boolean).forEach(p => {
        if (!all.includes(p)) all.push(p);
    });
    originLockedProfs.forEach(p => {
        if (!all.includes(p)) all.push(p);
    });
    freeSelectedProfs.forEach(p => {
        if (!all.includes(p)) all.push(p);
    });
    return all;
}

// =============================================
// INICIALIZAÇÃO
// =============================================
buildChoicesSection();
buildProfGrid();
updateProfCounter();
updateStats();