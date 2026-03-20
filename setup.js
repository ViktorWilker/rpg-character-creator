// ===========================================
// CONFIGURAÇÃO FIREBASE
// ===========================================
const firebaseConfig = {
    apiKey: "AIzaSyDM0jRreYlVfUpCm8YeZZuU9qJX2gQIOQo",
    authDomain: "rpg-character-creator-27288.firebaseapp.com",
    projectId: "rpg-character-creator-27288",
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

const API_URL  = 'http://localhost:3001';
const MASTER_UID = '5c0MguZyiqS1ppCD5Y0WnXNueGG2';

// ===========================================
// ESTADO GLOBAL
// ===========================================
let charObject     = null;
let currentUser    = null;
let currentSheetId = null;
let currentDocData = null;

// Inventário local (array de itens)
let inventoryItems = [];

// ===========================================
// HELPERS DE API
// ===========================================
const getToken = async () => {
    if (!currentUser) return null;
    return await currentUser.getIdToken();
};

const apiFetch = async (endpoint, options = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Erro na requisição');
    }
    return response.json();
};

// ===========================================
// APP
// ===========================================
const app = {

    // ------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------
    initWasm: function(Module) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                document.getElementById('user-email-display').innerText = user.email;
                document.getElementById('btn-logout').classList.remove('d-none');
                this.showDashboard();
            } else {
                currentUser = null;
                document.getElementById('btn-logout').classList.add('d-none');
                this.showLogin();
            }
        });
        this.setupBarListeners();
    },

    // ------------------------------------------------
    // NAVEGAÇÃO
    // ------------------------------------------------
    showLogin: () => app.switchScreen('login-screen'),

    showDashboard: function() {
        this.switchScreen('dashboard-screen');
        this.loadUserSheets();
    },

    showCreationScreen: function() {
        document.getElementById('create-name').value   = '';
        document.getElementById('create-age').value    = '25';
        document.getElementById('create-origin').value = '';
        document.getElementById('create-def').value    = '10';

        ['agi','str','int','pre','vig'].forEach(k => {
            const el = document.getElementById('val-' + k);
            if (el) el.textContent = '1';
        });
        const pointsEl = document.getElementById('pointsLeft');
        if (pointsEl) pointsEl.textContent = '4';

        if (typeof attrs !== 'undefined') {
            attrs             = { agi:1, str:1, int:1, pre:1, vig:1 };
            choiceSelections  = {};
            freeSelectedProfs = [];
            originLockedProfs = [];
            selectedClass     = 'Combatente';
            maesteryIndex     = 0;
            totalPoints       = 4;
            document.getElementById('create-maestery').value = 0;
            buildChoicesSection();
            buildProfGrid();
            updateProfCounter();
            updateStats();
        }

        document.querySelectorAll('.op-class-card').forEach(c => c.classList.remove('selected'));
        const first = document.querySelector('.op-class-card[data-class="Combatente"]');
        if (first) first.classList.add('selected');

        this.switchScreen('creation-screen');
    },

    showPlayScreen: () => app.switchScreen('play-screen'),

    switchScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen'));
        document.getElementById(screenId).classList.add('active-screen');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ------------------------------------------------
    // ABAS DA PLAY SCREEN
    // ------------------------------------------------
    switchTab: function(tabName) {
        document.querySelectorAll('.play-tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.play-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
        document.querySelector(`.play-tab-btn[data-tab="${tabName}"]`).classList.add('active');
    },

    // ------------------------------------------------
    // AUTH
    // ------------------------------------------------
    login: function() {
        auth.signInWithEmailAndPassword(
            document.getElementById('login-email').value,
            document.getElementById('login-pass').value
        ).catch(e => document.getElementById('login-msg').innerText = e.message);
    },

    register: function() {
        auth.createUserWithEmailAndPassword(
            document.getElementById('login-email').value,
            document.getElementById('login-pass').value
        ).catch(e => document.getElementById('login-msg').innerText = e.message);
    },

    logout: () => auth.signOut(),

    // ------------------------------------------------
    // DASHBOARD
    // ------------------------------------------------
    loadUserSheets: async function() {
        const listEl = document.getElementById('fichas-list');
        listEl.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text3);font-style:italic;">Carregando agentes...</div>';

        try {
            const fichas = await apiFetch('/fichas');
            listEl.innerHTML = '';

            if (fichas.length === 0) {
                listEl.innerHTML = `<div class="op-empty"><span class="op-empty-symbol">✦</span>Nenhum agente encontrado.<br>Crie o primeiro personagem.</div>`;
                return;
            }

            fichas.forEach(ficha => {
                const item = document.createElement('div');
                item.className = 'op-ficha-card';
                item.onclick = () => app.openSheet(ficha._id, ficha);
                item.innerHTML = `
                    <div>
                        <div class="op-ficha-name">${ficha.staticData.name}</div>
                        <div class="op-ficha-meta">${ficha.staticData.className} · ${ficha.staticData.origin || 'Origem desconhecida'} · Maestria ${ficha.staticData.maestery || 5}%</div>
                    </div>
                    <div class="op-ficha-badge">PV ${ficha.dynamicData.pvAtual} / ${ficha.staticData.pvMax}</div>
                `;
                listEl.appendChild(item);
            });
        } catch (err) {
            listEl.innerHTML = `<div style="color:var(--red-light);padding:1rem;font-style:italic;">${err.message}</div>`;
        }
    },

    // ------------------------------------------------
    // CRIAÇÃO
    // ------------------------------------------------
    saveNewCharacter: async function() {
        if (!currentUser) return;

        const getAttr = id => parseInt(document.getElementById(id)?.textContent) || 1;

        // Converte proficiências de array de strings para array de objetos com grau
        const rawProfs = typeof getAllSelectedProfs === 'function' ? getAllSelectedProfs() : [];
        const proficiencies = rawProfs.map(nome => ({ nome, grau: 'treinado' }));

        const staticData = {
            name:      document.getElementById('create-name').value.trim() || 'Agente Sem Nome',
            className: document.querySelector('.op-class-card.selected')?.dataset.class || 'Combatente',
            origin:    document.getElementById('create-origin').value || '',
            age:       parseInt(document.getElementById('create-age').value) || 25,
            attributes: {
                agi: getAttr('val-agi'), str: getAttr('val-str'),
                int: getAttr('val-int'), pre: getAttr('val-pre'), vig: getAttr('val-vig'),
            },
            defesa:         parseInt(document.getElementById('create-def').value) || 10,
            proficiencies,
            maestery:       MAESTERY_LEVELS[parseInt(document.getElementById('create-maestery')?.value) || 0],
            maesteryIndex:  parseInt(document.getElementById('create-maestery')?.value) || 0,
            peLimitPerRound:(parseInt(document.getElementById('create-maestery')?.value) || 0) + 1,
            pvMax: 0, peMax: 0, manaMax: 0,
        };

        const CLASS_BASES_LOCAL = {
            Combatente:   { pvBase: 20, peBase: 6,  manaBase: 0 },
            Especialista: { pvBase: 16, peBase: 8,  manaBase: 0 },
            Ocultista:    { pvBase: 12, peBase: 4,  manaBase: 8 }
        };
        const base = CLASS_BASES_LOCAL[staticData.className] || CLASS_BASES_LOCAL.Combatente;

        if (charObject) {
            charObject.setName(staticData.name);
            charObject.setAllAttributesValue(staticData.attributes.agi, staticData.attributes.str,
                staticData.attributes.int, staticData.attributes.pre, staticData.attributes.vig);
            charObject.calculateInitialPv();
            charObject.calculateInitialPe();
            charObject.calculateInitialMana();
            staticData.pvMax   = charObject.getPv();
            staticData.peMax   = charObject.getPe();
            staticData.manaMax = charObject.getMana();
        } else {
            staticData.pvMax   = base.pvBase   + staticData.attributes.vig;
            staticData.peMax   = base.peBase   + Math.floor((staticData.attributes.vig + staticData.attributes.agi) / 2);
            staticData.manaMax = base.manaBase + Math.floor((staticData.attributes.int + staticData.attributes.pre) / 2);
        }

        const dynamicData = {
            pvAtual: staticData.pvMax, peAtual: staticData.peMax, manaAtual: staticData.manaMax,
            inventario: [], notas: '', podesDesbloqueados: []
        };

        try {
            await apiFetch('/fichas', { method: 'POST', body: JSON.stringify({ staticData, dynamicData }) });
            this.showDashboard();
        } catch (err) {
            alert('Erro ao criar personagem: ' + err.message);
        }
    },

    // ------------------------------------------------
    // ABRIR FICHA
    // ------------------------------------------------
    openSheet: function(docId, data) {
        currentSheetId = docId;
        currentDocData = data;

        // Instancia WASM
        if (typeof Module !== 'undefined' && Module.CombatenteCharacter) {
            const classe = data.staticData.className;
            if (classe === 'CombatenteCharacter' || classe === 'Combatente')
                charObject = new Module.CombatenteCharacter();
            else if (classe === 'EspecialistaCharacter' || classe === 'Especialista')
                charObject = new Module.EspecialistaCharacter();
            else if (classe === 'OcultistaCharacter' || classe === 'Ocultista')
                charObject = new Module.OcultistaCharacter();

            if (charObject) {
                charObject.setName(data.staticData.name);
                charObject.setAllAttributesValue(
                    data.staticData.attributes.agi, data.staticData.attributes.str,
                    data.staticData.attributes.int, data.staticData.attributes.pre,
                    data.staticData.attributes.vig
                );
                charObject.setPv(data.dynamicData.pvAtual);
                charObject.setPe(data.dynamicData.peAtual);
                charObject.setMana(data.dynamicData.manaAtual);
                charObject.setMaestery(data.staticData.maestery || 5);
            }
        }

        // Cabeçalho
        document.getElementById('play-char-name').innerText  = data.staticData.name;
        document.getElementById('play-char-class').innerText =
            `${data.staticData.className} · ${data.staticData.origin || ''} · Maestria ${data.staticData.maestery || 5}%`;

        // Atributos
        document.getElementById('play-for').innerText = data.staticData.attributes.str;
        document.getElementById('play-agi').innerText = data.staticData.attributes.agi;
        document.getElementById('play-int').innerText = data.staticData.attributes.int;
        document.getElementById('play-pre').innerText = data.staticData.attributes.pre;
        document.getElementById('play-vig').innerText = data.staticData.attributes.vig;
        document.getElementById('play-def').innerText = data.staticData.defesa;
        document.getElementById('mob-for').innerText  = data.staticData.attributes.str;
        document.getElementById('mob-agi').innerText  = data.staticData.attributes.agi;
        document.getElementById('mob-int').innerText  = data.staticData.attributes.int;
        document.getElementById('mob-pre').innerText  = data.staticData.attributes.pre;
        document.getElementById('mob-vig').innerText  = data.staticData.attributes.vig;
        document.getElementById('mob-def').innerText  = data.staticData.defesa;

        // Vitais
        const pvMax   = data.staticData.pvMax;
        const peMax   = data.staticData.peMax;
        const manaMax = data.staticData.manaMax;
        document.getElementById('cur-hp').value              = data.dynamicData.pvAtual;
        document.getElementById('cur-stamina').value         = data.dynamicData.peAtual;
        document.getElementById('cur-mana').value            = data.dynamicData.manaAtual;
        document.getElementById('val-max-hp').innerText      = pvMax;
        document.getElementById('val-max-stamina').innerText = peMax;
        document.getElementById('val-max-mana').innerText    = manaMax;

        // Notas
        document.getElementById('play-notas').value = data.dynamicData.notas || '';

        // Perícias
        this.renderProficiencies(data.staticData.proficiencies || []);

        // Inventário
        inventoryItems = Array.isArray(data.dynamicData.inventario) ? [...data.dynamicData.inventario] : [];
        this.renderInventory();

        // Poderes
        this.renderPowers(data);

        this.updateBarsVisuals();
        this.switchTab('status');
        this.showPlayScreen();

        // Botão maestria só pro mestre
        const btnMaestery = document.getElementById('btn-maestery');
        if (btnMaestery) {
            btnMaestery.style.display =
                currentUser && currentUser.uid === MASTER_UID ? 'block' : 'none';
        }
    },

    // ------------------------------------------------
    // PERÍCIAS
    // ------------------------------------------------
    renderProficiencies: function(profs) {
        const container = document.getElementById('play-prof-list');
        if (!container) return;
        container.innerHTML = '';

        if (!profs || profs.length === 0) {
            container.innerHTML = '<div style="color:var(--text3);font-style:italic;font-size:0.85rem;">Nenhuma perícia registrada.</div>';
            return;
        }

        const GRAU_LABEL = { treinado: 'T', veterano: 'V', expert: 'E' };
        const GRAU_COLOR = { treinado: 'var(--text2)', veterano: 'var(--gold)', expert: 'var(--purple-light)' };
        const GRAU_BONUS = { treinado: '+5', veterano: '+10', expert: '+15' };

        profs.forEach((prof, idx) => {
            const nome = typeof prof === 'string' ? prof : prof.nome;
            const grau = typeof prof === 'string' ? 'treinado' : (prof.grau || 'treinado');

            const el = document.createElement('div');
            el.className = 'play-prof-item';
            el.innerHTML = `
                <span class="play-prof-name">${nome}</span>
                <div class="play-prof-right">
                    <span class="play-prof-bonus" style="color:${GRAU_COLOR[grau]}">${GRAU_BONUS[grau]}</span>
                    <select class="play-prof-grau-select" data-idx="${idx}" onchange="app.changeProfGrau(${idx}, this.value)">
                        <option value="treinado" ${grau==='treinado'?'selected':''}>Treinado</option>
                        <option value="veterano" ${grau==='veterano'?'selected':''}>Veterano</option>
                        <option value="expert"   ${grau==='expert'  ?'selected':''}>Expert</option>
                    </select>
                </div>
            `;
            container.appendChild(el);
        });
    },

    changeProfGrau: function(idx, novoGrau) {
        if (!currentDocData) return;
        const profs = currentDocData.staticData.proficiencies;
        if (typeof profs[idx] === 'string') {
            currentDocData.staticData.proficiencies[idx] = { nome: profs[idx], grau: novoGrau };
        } else {
            currentDocData.staticData.proficiencies[idx].grau = novoGrau;
        }
        this.renderProficiencies(currentDocData.staticData.proficiencies);
    },

    // ------------------------------------------------
    // INVENTÁRIO
    // ------------------------------------------------
    renderInventory: function() {
        const container = document.getElementById('play-inventory-list');
        if (!container) return;
        container.innerHTML = '';

        const totalPeso = inventoryItems.reduce((acc, item) => acc + (item.peso || 0), 0);
        document.getElementById('inv-total-peso').textContent = totalPeso;

        if (inventoryItems.length === 0) {
            container.innerHTML = '<div style="color:var(--text3);font-style:italic;font-size:0.85rem;padding:1rem 0;">Inventário vazio.</div>';
            return;
        }

        inventoryItems.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'inv-card';
            card.innerHTML = `
                <div class="inv-card-header">
                    <span class="inv-card-name">${item.nome}</span>
                    <div class="inv-card-tags">
                        <span class="inv-tag">${item.categoria}</span>
                        <span class="inv-tag">${item.peso} espaço${item.peso !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                ${item.descricao ? `<div class="inv-card-desc">${item.descricao}</div>` : ''}
                <button class="inv-btn-remove" onclick="app.removeInventoryItem('${item.id}')">Remover</button>
            `;
            container.appendChild(card);
        });
    },

    addInventoryItem: function() {
        const nome      = document.getElementById('inv-nome').value.trim();
        const categoria = document.getElementById('inv-categoria').value;
        const peso      = parseFloat(document.getElementById('inv-peso').value) || 0;
        const descricao = document.getElementById('inv-descricao').value.trim();

        if (!nome) {
            document.getElementById('inv-nome').focus();
            return;
        }

        inventoryItems.push({
            id: Date.now().toString(),
            nome, categoria, peso, descricao
        });

        // Limpa o form
        document.getElementById('inv-nome').value      = '';
        document.getElementById('inv-peso').value      = '0';
        document.getElementById('inv-descricao').value = '';

        this.renderInventory();
    },

    removeInventoryItem: function(id) {
        inventoryItems = inventoryItems.filter(i => i.id !== id);
        this.renderInventory();
    },

    // ------------------------------------------------
    // PODERES
    // ------------------------------------------------
    renderPowers: function(data) {
        const container = document.getElementById('play-powers-list');
        if (!container) return;
        container.innerHTML = '';

        const groups = [
            {
                label: 'Origem',
                items: data.staticData.originPoder ? [{
                    nome: data.staticData.originPoder,
                    descricao: data.staticData.originPoderDesc || ''
                }] : []
            },
            {
                label: 'Maestria',
                items: (data.dynamicData.podesDesbloqueados || []).filter(p => p.fonte === 'maestria')
            },
            {
                label: 'Classe',
                items: (data.dynamicData.podesDesbloqueados || []).filter(p => p.fonte === 'classe')
            }
        ];

        groups.forEach(group => {
            if (group.items.length === 0) return;
            const section = document.createElement('div');
            section.className = 'powers-group';
            section.innerHTML = `<div class="powers-group-label">${group.label}</div>`;
            group.items.forEach(poder => {
                const card = document.createElement('div');
                card.className = 'power-card';
                card.innerHTML = `
                    <div class="power-card-name">${poder.nome}</div>
                    ${poder.descricao ? `<div class="power-card-desc">${poder.descricao}</div>` : ''}
                `;
                section.appendChild(card);
            });
            container.appendChild(section);
        });

        if (container.innerHTML === '') {
            container.innerHTML = '<div style="color:var(--text3);font-style:italic;font-size:0.85rem;">Nenhum poder registrado ainda.</div>';
        }
    },

    // ------------------------------------------------
    // SALVAR
    // ------------------------------------------------
    savePlayState: async function() {
        if (!currentSheetId || !currentDocData) return;

        const dynamicData = {
            pvAtual:   parseInt(document.getElementById('cur-hp').value)      || 0,
            peAtual:   parseInt(document.getElementById('cur-stamina').value) || 0,
            manaAtual: parseInt(document.getElementById('cur-mana').value)    || 0,
            inventario: inventoryItems,
            notas:     document.getElementById('play-notas').value,
            podesDesbloqueados: currentDocData.dynamicData.podesDesbloqueados || []
        };

        // Salva graus de perícias atualizados
        const staticUpdate = {
            proficiencies: currentDocData.staticData.proficiencies
        };

        try {
            await apiFetch(`/fichas/${currentSheetId}`, {
                method: 'PUT',
                body: JSON.stringify({ dynamicData, staticUpdate })
            });
            const btn = document.getElementById('btn-save');
            const original = btn.innerText;
            btn.innerText = '✦ Salvo!';
            setTimeout(() => btn.innerText = original, 1500);
        } catch (err) {
            alert('Erro ao salvar: ' + err.message);
        }
    },

    // ------------------------------------------------
    // VITAIS — com limites
    // ------------------------------------------------
    setupBarListeners: function() {
        ['cur-hp', 'cur-mana', 'cur-stamina'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => {
                app.clampVital(id);
                app.updateBarsVisuals();
            });
        });
    },

    clampVital: function(inputId) {
        const input  = document.getElementById(inputId);
        const maxMap = {
            'cur-hp':      'val-max-hp',
            'cur-stamina': 'val-max-stamina',
            'cur-mana':    'val-max-mana'
        };
        const max = parseInt(document.getElementById(maxMap[inputId])?.innerText) || 999;
        let val   = parseInt(input.value) || 0;
        if (val < 0)   val = 0;
        if (val > max) val = max;
        input.value = val;
    },

    updateBarsVisuals: function() {
        const setBar = (inputId, maxId, barId) => {
            const cur = parseInt(document.getElementById(inputId).value) || 0;
            const max = parseInt(document.getElementById(maxId).innerText) || 1;
            document.getElementById(barId).style.width = Math.min(100, Math.max(0, (cur / max) * 100)) + '%';
        };
        setBar('cur-hp',      'val-max-hp',      'bar-hp');
        setBar('cur-stamina', 'val-max-stamina',  'bar-stamina');
        setBar('cur-mana',    'val-max-mana',     'bar-mana');
    },

    modStat: function(inputId, amount) {
        const input  = document.getElementById(inputId);
        const maxMap = {
            'cur-hp':      'val-max-hp',
            'cur-stamina': 'val-max-stamina',
            'cur-mana':    'val-max-mana'
        };
        const max = parseInt(document.getElementById(maxMap[inputId])?.innerText) || 999;
        let val   = (parseInt(input.value) || 0) + amount;
        if (val < 0)   val = 0;
        if (val > max) val = max;
        input.value = val;
        this.updateBarsVisuals();
    },

    // ------------------------------------------------
    // MAESTRIA UP
    // ------------------------------------------------
    maesteryUp: async function() {
        if (!charObject || !currentSheetId || !currentDocData) return;

        const resultJson     = charObject.maesteryUp();
        const maesteryResult = JSON.parse(resultJson);

        if (maesteryResult.erro) { alert(maesteryResult.erro); return; }

        document.getElementById('cur-hp').value              = maesteryResult.pvTotal;
        document.getElementById('cur-stamina').value         = maesteryResult.peTotal;
        document.getElementById('cur-mana').value            = maesteryResult.manaTotal;
        document.getElementById('val-max-hp').innerText      = maesteryResult.pvTotal;
        document.getElementById('val-max-stamina').innerText = maesteryResult.peTotal;
        document.getElementById('val-max-mana').innerText    = maesteryResult.manaTotal;
        this.updateBarsVisuals();

        const dynamicData = {
            pvAtual:    maesteryResult.pvTotal,
            peAtual:    maesteryResult.peTotal,
            manaAtual:  maesteryResult.manaTotal,
            inventario: inventoryItems,
            notas:      document.getElementById('play-notas').value,
            podesDesbloqueados: currentDocData.dynamicData.podesDesbloqueados || []
        };

        try {
            await apiFetch(`/fichas/${currentSheetId}/maestery-up`, {
                method: 'POST',
                body: JSON.stringify({ maesteryResult, dynamicData })
            });
            this.showMaesteryModal(maesteryResult);
        } catch (err) {
            alert('Erro ao salvar maestria: ' + err.message);
        }
    },

    showMaesteryModal: function(r) {
        const old = document.getElementById('maestery-modal');
        if (old) old.remove();

        const aviso = [];
        if (r.temAumentoAtributo) aviso.push('✦ Aumento de Atributo — escolha +1 em um atributo (máx 5)');
        if (r.temGrauTreinamento) aviso.push('✦ Grau de Treinamento — escolha 2+INT perícias para subir um grau');
        if (r.temVersatilidade)   aviso.push('✦ Versatilidade — escolha um poder de classe ou trilha');

        const modal = document.createElement('div');
        modal.id = 'maestery-modal';
        modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:'Cinzel',serif;`;
        modal.innerHTML = `
            <div style="background:#13131a;border:1px solid #c8a84b;padding:2.5rem;max-width:460px;width:90%;">
                <div style="font-size:0.65rem;letter-spacing:0.2em;color:#8a6e2e;margin-bottom:0.5rem;">MAESTRIA</div>
                <div style="font-size:1.6rem;color:#c8a84b;margin-bottom:1.5rem;">${r.novoNivelStr}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:1.5rem;">
                    <div style="background:#1a1a24;border:1px solid rgba(160,130,70,0.18);padding:0.85rem;text-align:center;">
                        <div style="font-size:0.6rem;letter-spacing:0.12em;color:#5a5248;margin-bottom:0.25rem;">PV</div>
                        <div style="font-size:1.4rem;color:#c0392b;">+${r.pvGanho}</div>
                    </div>
                    <div style="background:#1a1a24;border:1px solid rgba(160,130,70,0.18);padding:0.85rem;text-align:center;">
                        <div style="font-size:0.6rem;letter-spacing:0.12em;color:#5a5248;margin-bottom:0.25rem;">PE</div>
                        <div style="font-size:1.4rem;color:#2980b9;">+${r.peGanho}</div>
                    </div>
                    <div style="background:#1a1a24;border:1px solid rgba(160,130,70,0.18);padding:0.85rem;text-align:center;">
                        <div style="font-size:0.6rem;letter-spacing:0.12em;color:#5a5248;margin-bottom:0.25rem;">MANA</div>
                        <div style="font-size:1.4rem;color:#8e44ad;">+${r.manaGanho}</div>
                    </div>
                </div>
                <div style="font-size:0.82rem;color:#9a8f7a;margin-bottom:${aviso.length?'1rem':'1.5rem'};">
                    <span style="color:#5a5248;font-size:0.65rem;letter-spacing:0.12em;">HABILIDADE — </span>${r.habilidade}
                </div>
                ${aviso.length ? `<div style="border-top:1px solid rgba(160,130,70,0.18);padding-top:1rem;margin-bottom:1.5rem;">${aviso.map(a=>`<div style="font-size:0.78rem;color:#c8a84b;margin-bottom:0.4rem;">${a}</div>`).join('')}</div>` : ''}
                <button onclick="document.getElementById('maestery-modal').remove()"
                    style="width:100%;background:transparent;border:1px solid #c8a84b;color:#c8a84b;font-family:'Cinzel',serif;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;padding:0.85rem;cursor:pointer;">
                    Confirmar
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
};

var Module = Module || {};
Module.onRuntimeInitialized = function() { app.initWasm(Module); };