// ===========================================
// CONFIGURAÇÃO FIREBASE (só Auth, sem Firestore)
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

// ===========================================
// CONFIGURAÇÃO DA API
// ===========================================
const API_URL = 'http://localhost:3001';

// ===========================================
// ESTADO GLOBAL
// ===========================================
let charObject = null;
let currentUser = null;
let currentSheetId = null;
let currentDocData = null;

// ===========================================
// HELPER — pega o token do usuário logado
// ===========================================
const getToken = async () => {
    if (!currentUser) return null;
    return await currentUser.getIdToken();
};

// ===========================================
// HELPER — faz requisições autenticadas
// ===========================================
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

const app = {
    // ------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------
    initWasm: function(Module) {
        console.log("WASM Pronto.");
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
        // Reseta todos os campos do formulário de criação
        document.getElementById('create-name').value   = '';
        document.getElementById('create-age').value    = '25';
        document.getElementById('create-origin').value = '';
        document.getElementById('create-def').value    = '10';

        // Reseta atributos visuais (os valores reais ficam na variável attrs do HTML)
        ['agi','str','int','pre','vig'].forEach(k => {
            const el = document.getElementById('val-' + k);
            if (el) el.textContent = '1';
        });
        const pointsEl = document.getElementById('pointsLeft');
        if (pointsEl) pointsEl.textContent = '5';

        // Reseta seleção de classe pra Combatente
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
    // AUTH
    // ------------------------------------------------
    login: function() {
        const email = document.getElementById('login-email').value;
        const pass  = document.getElementById('login-pass').value;
        auth.signInWithEmailAndPassword(email, pass)
            .catch(e => document.getElementById('login-msg').innerText = e.message);
    },

    register: function() {
        const email = document.getElementById('login-email').value;
        const pass  = document.getElementById('login-pass').value;
        auth.createUserWithEmailAndPassword(email, pass)
            .catch(e => document.getElementById('login-msg').innerText = e.message);
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
                listEl.innerHTML = `
                    <div class="op-empty">
                        <span class="op-empty-symbol">✦</span>
                        Nenhum agente encontrado.<br>Crie o primeiro personagem.
                    </div>`;
                return;
            }

            fichas.forEach(ficha => {
                const item = document.createElement('div');
                item.className = 'op-ficha-card';
                item.onclick = () => app.openSheet(ficha._id, ficha);
                item.innerHTML = `
                    <div>
                        <div class="op-ficha-name">${ficha.staticData.name}</div>
                        <div class="op-ficha-meta">${ficha.staticData.className} · ${ficha.staticData.origin || 'Origem desconhecida'}</div>
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
    // CRIAÇÃO DE PERSONAGEM
    // ------------------------------------------------
    saveNewCharacter: async function() {
        if (!currentUser) return;

        // Lê os atributos dos spans visuais (controlados pelo JS de criação no HTML)
        const getAttr = id => parseInt(document.getElementById(id)?.textContent) || 1;

        const staticData = {
            name:      document.getElementById('create-name').value.trim() || 'Agente Sem Nome',
            className: (document.querySelector('.op-class-card.selected')?.dataset.class) || 'Combatente',
            origin:    document.getElementById('create-origin').value || '',
            age:       parseInt(document.getElementById('create-age').value) || 25,
            attributes: {
                agi: getAttr('val-agi'),
                str: getAttr('val-str'),
                int: getAttr('val-int'),
                pre: getAttr('val-pre'),
                vig: getAttr('val-vig'),
            },
            defesa:       parseInt(document.getElementById('create-def').value) || 10,
            proficiencies: typeof selectedProfs !== 'undefined' ? [...selectedProfs] : [],
            // Valores máximos — calculados abaixo (pelo WASM ou pelo front)
            pvMax:   0,
            peMax:   0,
            manaMax: 0,
        };

        // Bases por classe
        const CLASS_BASES = {
            Combatente:   { pvBase: 20, peBase: 6,  manaBase: 0 },
            Especialista: { pvBase: 16, peBase: 8,  manaBase: 0 },
            Ocultista:    { pvBase: 12, peBase: 4,  manaBase: 8 }
        };
        const base = CLASS_BASES[staticData.className] || CLASS_BASES.Combatente;

        // Integração WASM — se disponível, usa o C++ pra calcular
        if (charObject) {
            charObject.setName(staticData.name);
            charObject.setAllAttributesValue(
                staticData.attributes.agi,
                staticData.attributes.str,
                staticData.attributes.int,
                staticData.attributes.pre,
                staticData.attributes.vig
            );
            charObject.calculateInitialPv();
            charObject.calculateInitialPe();
            charObject.calculateInitialMana();
            staticData.pvMax   = charObject.getPv();
            staticData.peMax   = charObject.getPe();
            staticData.manaMax = charObject.getMana();
        } else {
            // Fallback JS quando WASM não está carregado
            staticData.pvMax   = base.pvBase   + staticData.attributes.vig;
            staticData.peMax   = base.peBase   + Math.floor((staticData.attributes.vig + staticData.attributes.agi) / 2);
            staticData.manaMax = base.manaBase + Math.floor((staticData.attributes.int + staticData.attributes.pre) / 2);
        }

        const dynamicData = {
            pvAtual:    staticData.pvMax,
            peAtual:    staticData.peMax,
            manaAtual:  staticData.manaMax,
            inventario: '',
            pericias:   ''
        };

        try {
            await apiFetch('/fichas', {
                method: 'POST',
                body: JSON.stringify({ staticData, dynamicData })
            });
            this.showDashboard();
        } catch (err) {
            alert('Erro ao criar personagem: ' + err.message);
        }
    },

    // ------------------------------------------------
    // TELA DE JOGO
    // ------------------------------------------------
    openSheet: function(docId, data) {
        currentSheetId = docId;
        currentDocData = data;

        // Cabeçalho
        document.getElementById('play-char-name').innerText  = data.staticData.name;
        document.getElementById('play-char-class').innerText = `${data.staticData.className} · ${data.staticData.origin || ''}`;

        // Atributos desktop
        document.getElementById('play-for').innerText = data.staticData.attributes.str;
        document.getElementById('play-agi').innerText = data.staticData.attributes.agi;
        document.getElementById('play-int').innerText = data.staticData.attributes.int;
        document.getElementById('play-pre').innerText = data.staticData.attributes.pre;
        document.getElementById('play-vig').innerText = data.staticData.attributes.vig;
        document.getElementById('play-def').innerText = data.staticData.defesa;

        // Atributos mobile
        document.getElementById('mob-for').innerText = data.staticData.attributes.str;
        document.getElementById('mob-agi').innerText = data.staticData.attributes.agi;
        document.getElementById('mob-int').innerText = data.staticData.attributes.int;
        document.getElementById('mob-pre').innerText = data.staticData.attributes.pre;
        document.getElementById('mob-vig').innerText = data.staticData.attributes.vig;
        document.getElementById('mob-def').innerText = data.staticData.defesa;

        // Vitais — valores atuais
        document.getElementById('cur-hp').value      = data.dynamicData.pvAtual;
        document.getElementById('cur-stamina').value = data.dynamicData.peAtual;
        document.getElementById('cur-mana').value    = data.dynamicData.manaAtual;

        // Vitais — máximos
        document.getElementById('val-max-hp').innerText      = data.staticData.pvMax;
        document.getElementById('val-max-stamina').innerText = data.staticData.peMax;
        document.getElementById('val-max-mana').innerText    = data.staticData.manaMax;

        // Texto livre
        document.getElementById('play-pericias').value   = data.dynamicData.pericias   || '';
        document.getElementById('play-inventario').value = data.dynamicData.inventario || '';

        this.updateBarsVisuals();
        this.showPlayScreen();
    },

    savePlayState: async function() {
        if (!currentSheetId || !currentDocData) return;

        const dynamicData = {
            pvAtual:    parseInt(document.getElementById('cur-hp').value)      || 0,
            peAtual:    parseInt(document.getElementById('cur-stamina').value) || 0,
            manaAtual:  parseInt(document.getElementById('cur-mana').value)    || 0,
            inventario: document.getElementById('play-inventario').value,
            pericias:   document.getElementById('play-pericias').value
        };

        try {
            await apiFetch(`/fichas/${currentSheetId}`, {
                method: 'PUT',
                body: JSON.stringify({ dynamicData })
            });
            // Feedback visual no botão
            const btn = document.getElementById('btn-save');
            const original = btn.innerText;
            btn.innerText = '✦ Salvo!';
            setTimeout(() => btn.innerText = original, 1500);
        } catch (err) {
            alert('Erro ao salvar: ' + err.message);
        }
    },

    // ------------------------------------------------
    // AUXILIARES VISUAIS
    // ------------------------------------------------
    setupBarListeners: function() {
        ['cur-hp', 'cur-mana', 'cur-stamina'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => app.updateBarsVisuals());
        });
    },

    updateBarsVisuals: function() {
        const setBar = (inputId, maxId, barId) => {
            const cur = parseInt(document.getElementById(inputId).value) || 0;
            const max = parseInt(document.getElementById(maxId).innerText)  || 1;
            document.getElementById(barId).style.width = Math.min(100, Math.max(0, (cur / max) * 100)) + '%';
        };
        setBar('cur-hp',      'val-max-hp',      'bar-hp');
        setBar('cur-stamina', 'val-max-stamina',  'bar-stamina');
        setBar('cur-mana',    'val-max-mana',     'bar-mana');
    },

    modStat: function(inputId, amount) {
        const input = document.getElementById(inputId);
        input.value = (parseInt(input.value) || 0) + amount;
        this.updateBarsVisuals();
    }
};

// ===========================================
// INICIALIZAÇÃO DO WASM
// ===========================================
var Module = Module || {};
Module.onRuntimeInitialized = function() {
    app.initWasm(Module);
};