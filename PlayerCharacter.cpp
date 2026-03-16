#include "include/PlayerCharacter.h"
#include "include/attribute.h"
#include "include/proficiencies.h"
#include "include/origins_data.h"
#include "PlayerCharacter.h"

using json = nlohmann::json;

static const int MAESTERY_LEVELS[] = {
    5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
    55, 60, 65, 70, 75, 80, 85, 90, 95, 99
};
static const int MAESTERY_COUNT = 20;

int Character::GetAttributeValue(Attribute attribute) const {
    return this->_attributes.at(attribute);
}

void Character::SetAttributeValue(Attribute attribute, int Value) {
    this->_attributes[attribute] = Value;
}

void Character::SetAllAttributesValue(int agi, int str, int inte, int pre, int vig) {
    SetAttributeValue(Attribute::Agility,   agi);
    SetAttributeValue(Attribute::Strength,  str);
    SetAttributeValue(Attribute::Intellect, inte);
    SetAttributeValue(Attribute::Presence,  pre);
    SetAttributeValue(Attribute::Vigor,     vig);
}

void Character::SetName(const std::string& Lname) {
    this->name = Lname;
}

std::string Character::GetName() const {
    return this->name;
}

void Character::SetOrigin(const std::string& originId) {
    try {
        OrigensDB& db      = GetOrigensDB();
        OrigemData dados   = db.GetOrigem(originId);

        this->origin          = originId;
        this->originNome      = dados.nome;
        this->originPoder     = dados.poder.nome;
        this->originPoderDesc = dados.poder.descricao;

        for (const auto& pericia : dados.pericias) {
            AddProficiencyByName(pericia);
        }
    } catch (const std::exception&) {
        this->origin     = originId;
        this->originNome = originId;
    }
}

std::string Character::GetOrigin() const {
    return this->originNome.empty() ? this->origin : this->originNome;
}

std::string Character::GetOriginId() const {
    return this->origin;
}

std::string Character::GetOriginPoder() const {
    return this->originPoder;
}

std::string Character::GetOriginPoderDesc() const {
    return this->originPoderDesc;
}

void Character::SetCorruptionValue(int value) { this->corruption = value; }
void Character::IncrementCorruptionValue(int value) { this->corruption += value; }
int  Character::GetCorruptionValue() const { return this->corruption; }

void Character::SetDefValue(int value)  { this->defValue = value; }
void Character::AddDefValue(int value)  { this->defValue += value; }
int  Character::GetDefValue() const     { return this->defValue; }


int  Character::GetPvBase() const       { return _pvBase; }
void Character::SetPvBase(int value)    { this->_pvBase = value; }
void Character::SetPv(int value)        { pv = value; }

void Character::CalculateInitialPv() {
    this->pv = _pvBase + GetAttributeValue(Attribute::Vigor);
}

void Character::UpdatePv(int val) {
    this->pv += val;
}

void Character::DecrementPv()     { pv -= 1; }
int  Character::GetPv() const     { return pv; }

int  Character::GetPeBase() const       { return this->_peBase; }
void Character::SetPeBase(int value)    { this->_peBase = value; }
void Character::SetPe(int value)        { pe = value; }
void Character::DecrementPe()           { pe -= 1; }

void Character::CalculateInitialPe() {
    this->pe = _peBase + ((GetAttributeValue(Attribute::Vigor) + GetAttributeValue(Attribute::Agility)) / 2);
}

void Character::UpdatePe(int val) {
    this->pe += val;
}

int Character::GetPe() const     { return this->pe; }
int Character::GetPeLimit() const { return this->peLimitPerRound; }
int  Character::GetManaBase() const     { return _manaBase; }
void Character::SetManaBase(int value)  { this->_manaBase = value; }
void Character::SetMana(int value)      { mana = value; }
void Character::DecrementMana()         { mana -= 1; }

void Character::CalculateInitialMana() {
    mana = _manaBase + ((GetAttributeValue(Attribute::Intellect) + GetAttributeValue(Attribute::Presence)) / 2);
}

void Character::UpdateMana(int val) {
    this->mana += val;
}

int Character::GetMana() const   { return mana; }

void Character::AddProficiecys(Proficiency Lproficiency) {
    if (std::find(proficiencies.begin(), proficiencies.end(), Lproficiency) == proficiencies.end()) {
        proficiencies.push_back(Lproficiency);
    }
}

void Character::AddProficiencyByName(const std::string& nome) {
    static const std::map<std::string, Proficiency> mapa = {
        {"Acrobacia",    Proficiency::Acrobacia},
        {"Adestramento", Proficiency::Adestramento},
        {"Arcano",       Proficiency::Arcano},
        {"Artes",        Proficiency::Artes},
        {"Atletismo",    Proficiency::Atletismo},
        {"Atualidades",  Proficiency::Atualidades},
        {"Ciencias",     Proficiency::Ciencias},
        {"Crime",        Proficiency::Crime},
        {"Diplomacia",   Proficiency::Diplomacia},
        {"Enganacao",    Proficiency::Enganacao},
        {"Fortitude",    Proficiency::Fortitude},
        {"Furtividade",  Proficiency::Furtividade},
        {"Iniciativa",   Proficiency::Iniciativa},
        {"Intimidacao",  Proficiency::Intimidacao},
        {"Intuicao",     Proficiency::Intuicao},
        {"Investigacao", Proficiency::Investigacao},
        {"Luta",         Proficiency::Luta},
        {"Medicina",     Proficiency::Medicina},
        {"Percepcao",    Proficiency::Percepcao},
        {"Pilotagem",    Proficiency::Pilotagem},
        {"Pontaria",     Proficiency::Pontaria},
        {"Profissao",    Proficiency::Profissao},
        {"Reflexos",     Proficiency::Reflexos},
        {"Religiao",     Proficiency::Religiao},
        {"Sobrevivencia",Proficiency::Sobrevivencia},
        {"Tatica",       Proficiency::Tatica},
        {"Tecnologia",   Proficiency::Tecnologia},
        {"Vontade",      Proficiency::Vontade}
    };

    auto it = mapa.find(nome);
    if (it == mapa.end()) return;

    proficiencies.push_back(it->second);
}

int Character::CalculateProficiesAmount() {
    return proficienciesAmountBase + GetAttributeValue(Attribute::Intellect);
}

std::vector<Proficiency> Character::GetProficies() {
    return proficiencies;
}

int Character::GetMaestery() const {
    return maestery;
}

std::string Character::GetMaesteryStr() const {
    return std::to_string(maestery) + "%";
}

int Character::GetMaesteryIndex() const {
    return maesteryIndex;
}

void Character::SetMaestery(int value) {
    maestery = value;
    for (int i = 0; i < MAESTERY_COUNT; i++) {
        if (MAESTERY_LEVELS[i] == value) {
            maesteryIndex   = i;
            peLimitPerRound = i + 1;
            break;
        }
    }
}

int Character::CalculatePvGain() const {
    return pvPerLevel + GetAttributeValue(Attribute::Vigor);
}

int Character::CalculatePeGain() const {
    return pePerLevel + ((GetAttributeValue(Attribute::Vigor) + GetAttributeValue(Attribute::Agility)) / 2);
}

int Character::CalculateManaGain() const {
    return manaPerLevel + ((GetAttributeValue(Attribute::Intellect) + GetAttributeValue(Attribute::Presence)) / 2);
}

std::string Character::MaesteryUp() {
    if (maesteryIndex >= MAESTERY_COUNT - 1) {
        json j;
        j["erro"] = "Personagem ja esta no nivel maximo (99%)";
        return j.dump();
    }

    int pvGanho   = CalculatePvGain();
    int peGanho   = CalculatePeGain();
    int manaGanho = CalculateManaGain();

    maesteryIndex++;
    maestery        = MAESTERY_LEVELS[maesteryIndex];
    peLimitPerRound = maesteryIndex + 1;

    pv   += pvGanho;
    pe   += peGanho;
    mana += manaGanho;

    std::string habilidade      = GetMaesterySkill(maesteryIndex);
    bool temAttrBonus           = GetMaesteryHasAttrBonus(maesteryIndex);
    int  novoLimitePe           = GetMaesteryPeLimit(maesteryIndex);

    bool temGrauTreinamento = (maesteryIndex == 6 || maesteryIndex == 13); 
    bool temVersatilidade   = (maesteryIndex == 9);                        

    json result;
    result["novoNivel"]          = maestery;
    result["novoNivelStr"]       = GetMaesteryStr();
    result["pvGanho"]            = pvGanho;
    result["peGanho"]            = peGanho;
    result["manaGanho"]          = manaGanho;
    result["pvTotal"]            = pv;
    result["peTotal"]            = pe;
    result["manaTotal"]          = mana;
    result["novoLimitePe"]       = novoLimitePe;
    result["habilidade"]         = habilidade;
    result["temAumentoAtributo"] = temAttrBonus;
    result["temGrauTreinamento"] = temGrauTreinamento;
    result["temVersatilidade"]   = temVersatilidade;

    return result.dump(4);
}

void Character::UpdateStatsValue(int Lpv, int Lpe, int Lmana) {
    UpdatePv(Lpv);
    UpdatePe(Lpe);
    UpdateMana(Lmana);
}

std::string Character::ToJson() const {
    json j;
    j["className"]       = GetClassName();
    j["name"]            = name;
    j["age"]             = age;
    j["pv"]              = pv;
    j["pe"]              = pe;
    j["mana"]            = mana;
    j["defValue"]        = defValue;
    j["corruption"]      = corruption;
    j["maestery"]        = maestery;
    j["maesteryIndex"]   = maesteryIndex;
    j["peLimitPerRound"] = peLimitPerRound;

    j["originId"]        = origin;
    j["origin"]          = GetOrigin();
    j["originPoder"]     = originPoder;
    j["originPoderDesc"] = originPoderDesc;

    j["attributes"][ToString(Attribute::Agility)]   = GetAttributeValue(Attribute::Agility);
    j["attributes"][ToString(Attribute::Strength)]  = GetAttributeValue(Attribute::Strength);
    j["attributes"][ToString(Attribute::Intellect)] = GetAttributeValue(Attribute::Intellect);
    j["attributes"][ToString(Attribute::Presence)]  = GetAttributeValue(Attribute::Presence);
    j["attributes"][ToString(Attribute::Vigor)]     = GetAttributeValue(Attribute::Vigor);

    json profs_array = json::array();
    for (const auto& prof : proficiencies) {
        profs_array.push_back(ToString(prof));
    }
    j["proficiencies"] = profs_array;

    return j.dump(4);
}

void Character::FromJson(const std::string& jsonString) {
    json j = json::parse(jsonString);

    name       = j.value("name", "");
    age        = j.value("age", 25);
    pv         = j.value("pv", 0);
    pe         = j.value("pe", 0);
    mana       = j.value("mana", 0);
    defValue   = j.value("defValue", 0);
    corruption = j.value("corruption", 0);

    maestery        = j.value("maestery", 5);
    maesteryIndex   = j.value("maesteryIndex", 0);
    peLimitPerRound = j.value("peLimitPerRound", 1);

    origin          = j.value("originId", "");
    originNome      = j.value("origin", "");
    originPoder     = j.value("originPoder", "");
    originPoderDesc = j.value("originPoderDesc", "");

    if (j.contains("attributes")) {
        SetAttributeValue(Attribute::Agility,   j["attributes"].value(ToString(Attribute::Agility),   1));
        SetAttributeValue(Attribute::Strength,  j["attributes"].value(ToString(Attribute::Strength),  1));
        SetAttributeValue(Attribute::Intellect, j["attributes"].value(ToString(Attribute::Intellect), 1));
        SetAttributeValue(Attribute::Presence,  j["attributes"].value(ToString(Attribute::Presence),  1));
        SetAttributeValue(Attribute::Vigor,     j["attributes"].value(ToString(Attribute::Vigor),     1));
    }

    proficiencies.clear();
    if (j.contains("proficiencies") && j["proficiencies"].is_array()) {
        for (const auto& p : j["proficiencies"]) {
            AddProficiencyByName(p.get<std::string>());
        }
    }
}