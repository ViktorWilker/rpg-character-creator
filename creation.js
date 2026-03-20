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

// Regras de proficiências por classe
const CLASS_PROF_RULES = {
    Combatente: {
        // Grupos de escolha obrigatória — jogador escolhe UM de cada grupo
        choices: [
            { label: 'Combate', options: ['Luta', 'Pontaria'] },
            { label: 'Resistência', options: ['Fortitude', 'Reflexos'] }
        ],
        // Perícias completamente fixas (sem escolha)
        fixed: [],
        // Perícias livres além das obrigatórias
        freeBase: 1
    },
    Especialista: {
        choices: [],
        fixed: [],
        freeBase: 7   // 7 livres + INT
    },
    Ocultista: {
        choices: [],
        fixed: ['Ocultismo', 'Vontade'],
        freeBase: 3   // 3 livres + INT
    }
};

const CLASS_BASES = {
    Combatente:   { pvBase: 20, peBase: 6,  manaBase: 0 },
    Especialista: { pvBase: 16, peBase: 8,  manaBase: 0 },
    Ocultista:    { pvBase: 12, peBase: 4,  manaBase: 8 }
};

const MAESTERY_LEVELS = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99];

// Mapa de origem → perícias (para marcar como locked)
// Será populado dinamicamente via WASM ou fallback estático
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
let attrs       = { agi:1, str:1, int:1, pre:1, vig:1 };
let totalPoints = 4;   // CORRIGIDO: 4 pontos, não 5
let selectedClass = 'Combatente';

// Proficiências escolhidas nos grupos obrigatórios: { groupIndex: 'NomeEscolhido' }
let choiceSelections = {};
// Proficiências livres selecionadas (não inclui fixed nem choices nem origin)
let freeSelectedProfs = [];
// Perícias da origem atual (locked)
let originLockedProfs = [];

// =============================================
// HELPERS
// =============================================
function getPointsUsed() {
    return Object.values(attrs).reduce((a, b) => a + b, 0) - 5;
}

function getTotalFreeProfs() {
    return CLASS_PROF_RULES[selectedClass].freeBase + attrs.int;
}

function getAllSelectedProfs() {
    const all = [];
    // Fixas da classe
    CLASS_PROF_RULES[selectedClass].fixed.forEach(p => all.push(p));
    // Escolhas obrigatórias já resolvidas
    Object.values(choiceSelections).forEach(p => { if (p) all.push(p); });
    // Da origem
    originLockedProfs.forEach(p => { if (!all.includes(p)) all.push(p); });
    // Livres
    freeSelectedProfs.forEach(p => { if (!all.includes(p)) all.push(p); });
    return all;
}

function isProfLocked(p) {
    const rules = CLASS_PROF_RULES[selectedClass];
    if (rules.fixed.includes(p)) return true;
    if (originLockedProfs.includes(p)) return true;
    return false;
}

function isProfChoiceSelected(p) {
    return Object.values(choiceSelections).includes(p);
}

// =============================================
// SEÇÃO DE ESCOLHAS OBRIGATÓRIAS
// =============================================
function buildChoicesSection() {
    const rules = CLASS_PROF_RULES[selectedClass];
    const container = document.getElementById('profChoices');

    if (!rules.choices || rules.choices.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = '';

    rules.choices.forEach((group, idx) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'op-prof-choice-group';
        groupEl.innerHTML = `<div class="op-prof-choice-label">Escolha uma — ${group.label}</div>
            <div class="op-prof-choice-options" id="choice-group-${idx}"></div>`;
        container.appendChild(groupEl);

        const optionsEl = groupEl.querySelector(`#choice-group-${idx}`);
        group.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'op-prof-choice-btn' + (choiceSelections[idx] === opt ? ' selected' : '');
            btn.textContent = opt;
            btn.onclick = () => selectChoice(idx, opt);
            optionsEl.appendChild(btn);
        });
    });
}

function selectChoice(groupIdx, option) {
    choiceSelections[groupIdx] = option;
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

    // Remove da lista livre qualquer perícia que agora é choice ou locked
    const allChosen = [...CLASS_PROF_RULES[selectedClass].fixed, ...Object.values(choiceSelections), ...originLockedProfs];
    freeSelectedProfs = freeSelectedProfs.filter(p => !allChosen.includes(p));

    PROFICIENCIAS.forEach(p => {
        const el = document.createElement('div');
        const isLocked  = isProfLocked(p);
        const isChoice  = isProfChoiceSelected(p);
        const isFree    = freeSelectedProfs.includes(p);

        if (isLocked || isChoice) {
            el.className = 'op-prof-tag locked';
            el.title = isLocked && originLockedProfs.includes(p)
                ? 'Perícia da origem — não pode ser removida'
                : 'Perícia fixa da classe';
        } else {
            el.className = 'op-prof-tag' + (isFree ? ' selected' : '');
            el.onclick = () => toggleFreeProf(p, el);
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
        const max = getTotalFreeProfs();
        if (freeSelectedProfs.length >= max) return;
        freeSelectedProfs.push(p);
        el.classList.add('selected');
    }
    updateProfCounter();
}

function updateProfCounter() {
    const max = getTotalFreeProfs();
    document.getElementById('maxProf').textContent = max;
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
    updateMaesteryDisplay(document.getElementById('create-maestery')?.value || 0);
}

// =============================================
// ORIGEM
// =============================================
function onOriginChange() {
    const val = document.getElementById('create-origin').value;
    originLockedProfs = ORIGIN_PERICIAS[val] || [];
    // Remove da seleção livre qualquer perícia que agora é da origem
    freeSelectedProfs = freeSelectedProfs.filter(p => !originLockedProfs.includes(p));
    // Remove das choices se coincidirem (regra veterano — não remove, mantém marcado)
    buildChoicesSection();
    buildProfGrid();
    updateProfCounter();
}

// =============================================
// ATRIBUTOS
// =============================================
function changeAttr(key, delta) {
    const newVal = attrs[key] + delta;
    if (newVal < 0) return;   // pode zerar (regra de ganhar +1 ponto)
    if (newVal > 3) return;   // máximo 3 na criação
    if (delta > 0 && getPointsUsed() >= totalPoints) return;
    attrs[key] = newVal;
    document.getElementById('val-' + key).textContent = newVal;
    document.getElementById('pointsLeft').textContent = totalPoints - getPointsUsed();
    updateStats();
    updateProfCounter();
    buildProfGrid(); // atualiza pq INT afeta o total livre
}

function updateStats() {
    const b = CLASS_BASES[selectedClass];
    document.getElementById('statPv').textContent   = b.pvBase   + attrs.vig;
    document.getElementById('statPe').textContent   = b.peBase   + Math.floor((attrs.vig + attrs.agi) / 2);
    document.getElementById('statMana').textContent = b.manaBase + Math.floor((attrs.int + attrs.pre) / 2);
}

// =============================================
// MAESTRIA
// =============================================
function updateMaesteryDisplay(index) {
    const i = parseInt(index);
    document.getElementById('maestery-display').textContent = MAESTERY_LEVELS[i] + '%';
    if (typeof Module !== 'undefined' && Module.Combatente_GetSkill) {
        let skill = '';
        if (selectedClass === 'Combatente')   skill = Module.Combatente_GetSkill(i);
        if (selectedClass === 'Especialista') skill = Module.Especialista_GetSkill(i);
        if (selectedClass === 'Ocultista')    skill = Module.Ocultista_GetSkill(i);
        document.getElementById('maestery-skill-display').textContent = skill;
    }
}

// =============================================
// INICIALIZAÇÃO
// =============================================
buildChoicesSection();
buildProfGrid();
updateProfCounter();
updateStats();