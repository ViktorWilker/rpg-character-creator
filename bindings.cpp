
#include <emscripten/bind.h>
#include <memory>
#include <string>
#include <vector>
#include "PlayerCharacter.h"
#include "include/attribute.h"
#include "include/proficiencies.h"
#include "include/origins_data.h"
#include "include/CombatenteCharacter.h"
#include "include/EspecialistaCharacter.h"
#include "include/OcultistaCharacter.h"
#include "include/Ocultista_Maestery.h"
#include "include/Combatente_Maestery.h"
#include "include/Especialista_Maestery.h"

using namespace emscripten;

std::string GetOrigensDisponiveis() {
    nlohmann::json result = nlohmann::json::array();
    OrigensDB& db = GetOrigensDB();
    for (const auto& id : db.ListarOrigens()) {
        OrigemData o = db.GetOrigem(id);
        nlohmann::json item;
        item["id"]        = o.id;
        item["nome"]      = o.nome;
        item["pericias"]  = o.pericias;
        item["poder"]     = o.poder.nome;
        item["poderDesc"] = o.poder.descricao;
        if (o.pericias_livres > 0) {
            item["pericasLivres"] = o.pericias_livres;
            item["pericasNota"]   = o.pericias_nota;
        }
        result.push_back(item);
    }
    return result.dump();
}

std::string GetPericiasDaOrigem(const std::string& id) {
    OrigensDB& db = GetOrigensDB();
    nlohmann::json arr = db.GetPericiasDaOrigem(id);
    return arr.dump();
}

std::string GetPoderDaOrigem(const std::string& id) {
    OrigensDB& db = GetOrigensDB();
    Poder p = db.GetPoderDaOrigem(id);
    nlohmann::json j;
    j["nome"]      = p.nome;
    j["descricao"] = p.descricao;
    return j.dump();
}

std::string GetRegrasDaClasse(const std::string& classe, int intScore) {
    OrigensDB& db = GetOrigensDB();
    nlohmann::json j;
    j["fixas"]        = db.GetPericasFixasDaClasse(classe);
    j["fixasEscolha"] = db.GetEscolhasObrigatorias(classe);
    j["livres"]       = db.GetTotalPericasLivres(classe, intScore);
    return j.dump();
}

    std::string Ocultista_GetSkill_JS(int index) {
    return OcultistaData::GetSkill(static_cast<OcultistaData::Maestery_Ocultista>(index));
    }
    bool Ocultista_HasAttrBonus_JS(int index) {
    return OcultistaData::HasAttributeBonus(static_cast<OcultistaData::Maestery_Ocultista>(index));
    }
    std::string Ocultista_GetPeLimit_JS(int index) {
    return OcultistaData::GetPeLimit(static_cast<OcultistaData::Maestery_Ocultista>(index));
    }

    std::string Combatente_GetSkill_JS(int index) {
    return CombatenteData::GetSkill(static_cast<CombatenteData::Maestery_Combatente>(index));
    }
    bool Combatente_HasAttrBonus_JS(int index) {
    return CombatenteData::HasAttributeBonus(static_cast<CombatenteData::Maestery_Combatente>(index));
    }
    std::string Combatente_GetPeLimit_JS(int index) {
    return CombatenteData::GetPeLimit(static_cast<CombatenteData::Maestery_Combatente>(index));
    }

    std::string Especialista_GetSkill_JS(int index) {
    return EspecialistaData::GetSkill(static_cast<EspecialistaData::Maestery_Especialista>(index));
    }
    bool Especialista_HasAttrBonus_JS(int index) {
    return EspecialistaData::HasAttributeBonus(static_cast<EspecialistaData::Maestery_Especialista>(index));
    }
    std::string Especialista_GetPeLimit_JS(int index) {
    return EspecialistaData::GetPeLimit(static_cast<EspecialistaData::Maestery_Especialista>(index));
    }
    

EMSCRIPTEN_BINDINGS(containers) {
    register_vector<Proficiency>("VectorProficiency");
    register_vector<std::string>("VectorString");
}

EMSCRIPTEN_BINDINGS(enums) {
    enum_<Attribute>("Attribute")
        .value("Strength",  Attribute::Strength)
        .value("Agility",   Attribute::Agility)
        .value("Intellect", Attribute::Intellect)
        .value("Presence",  Attribute::Presence)
        .value("Vigor",     Attribute::Vigor);

    enum_<Proficiency>("Proficiency")
        .value("Acrobacia",    Proficiency::Acrobacia)
        .value("Adestramento", Proficiency::Adestramento)
        .value("Arcano",       Proficiency::Arcano)
        .value("Artes",        Proficiency::Artes)
        .value("Atletismo",    Proficiency::Atletismo)
        .value("Atualidades",  Proficiency::Atualidades)
        .value("Ciencias",     Proficiency::Ciencias)
        .value("Crime",        Proficiency::Crime)
        .value("Diplomacia",   Proficiency::Diplomacia)
        .value("Enganacao",    Proficiency::Enganacao)
        .value("Fortitude",    Proficiency::Fortitude)
        .value("Furtividade",  Proficiency::Furtividade)
        .value("Iniciativa",   Proficiency::Iniciativa)
        .value("Intimidacao",  Proficiency::Intimidacao)
        .value("Intuicao",     Proficiency::Intuicao)
        .value("Investigacao", Proficiency::Investigacao)
        .value("Luta",         Proficiency::Luta)
        .value("Medicina",     Proficiency::Medicina)
        .value("Percepcao",    Proficiency::Percepcao)
        .value("Pilotagem",    Proficiency::Pilotagem)
        .value("Pontaria",     Proficiency::Pontaria)
        .value("Profissao",    Proficiency::Profissao)
        .value("Reflexos",     Proficiency::Reflexos)
        .value("Religiao",     Proficiency::Religiao)
        .value("Sobrevivencia",Proficiency::Sobrevivencia)
        .value("Tatica",       Proficiency::Tatica)
        .value("Tecnologia",   Proficiency::Tecnologia)
        .value("Vontade",      Proficiency::Vontade);
}

EMSCRIPTEN_BINDINGS(origins_functions) {
    function("getOrigensDisponiveis", &GetOrigensDisponiveis);
    function("getPericiasDaOrigem",   &GetPericiasDaOrigem);
    function("getPoderDaOrigem",      &GetPoderDaOrigem);
    function("getRegrasDaClasse",     &GetRegrasDaClasse);
}

EMSCRIPTEN_BINDINGS(rpg_module) {
    class_<Character>("Character")
        .smart_ptr<std::shared_ptr<Character>>("shared_ptr<Character>")
        .constructor<>()

        .function("getClassName", &Character::GetClassName)
        .function("toJson",       &Character::ToJson)
        .function("fromJson",     &Character::FromJson)

        .function("setName",  &Character::SetName)
        .function("getName",  &Character::GetName)
        .property("age",      &Character::age)

        .function("setOrigin",          &Character::SetOrigin)
        .function("getOrigin",          &Character::GetOrigin)
        .function("getOriginId",        &Character::GetOriginId)
        .function("getOriginPoder",     &Character::GetOriginPoder)
        .function("getOriginPoderDesc", &Character::GetOriginPoderDesc)

        .function("getAttributeValue",     &Character::GetAttributeValue)
        .function("setAttributeValue",     &Character::SetAttributeValue)
        .function("setAllAttributesValue", &Character::SetAllAttributesValue)

        .function("addProficiecy",          &Character::AddProficiecys)
        .function("addProficiencyByName",   &Character::AddProficiencyByName)
        .function("calculateProficiesAmount",&Character::CalculateProficiesAmount)
        .function("getProficies",           &Character::GetProficies)

        .function("setDefValue", &Character::SetDefValue)
        .function("addDefValue", &Character::AddDefValue)
        .function("getDefValue", &Character::GetDefValue)

        .function("calculateInitialPv", &Character::CalculateInitialPv)
        .function("setPv",              &Character::SetPv)
        .function("decrementPv",        &Character::DecrementPv)
        .function("setPvBase",          &Character::SetPvBase)
        .function("getPvBase",          &Character::GetPvBase)
        .function("getPv",              &Character::GetPv)
        .function("updatePv",           &Character::UpdatePv)

        .function("decrementPe",        &Character::DecrementPe)
        .function("setPe",              &Character::SetPe)
        .function("setPeBase",          &Character::SetPeBase)
        .function("getPeBase",          &Character::GetPeBase)
        .function("getPe",              &Character::GetPe)
        .function("calculateInitialPe", &Character::CalculateInitialPe)
        .function("updatePe",           &Character::UpdatePe)

        .function("decrementMana",        &Character::DecrementMana)
        .function("setMana",              &Character::SetMana)
        .function("setManaBase",          &Character::SetManaBase)
        .function("getManaBase",          &Character::GetManaBase)
        .function("getMana",              &Character::GetMana)
        .function("calculateInitialMana", &Character::CalculateInitialMana)
        .function("updateMana",           &Character::UpdateMana)

        .function("updateStatsValue", &Character::UpdateStatsValue)
        .function("setMaestery",      &Character::SetMaestery)
        .function("maesteryUp",       &Character::MaesteryUp)
        ;

    class_<OcultistaCharacter, base<Character>>("OcultistaCharacter")
        .smart_ptr<std::shared_ptr<OcultistaCharacter>>("shared_ptr<OcultistaCharacter>")
        .constructor<>()
        ;

    class_<EspecialistaCharacter, base<Character>>("EspecialistaCharacter")
        .smart_ptr<std::shared_ptr<EspecialistaCharacter>>("shared_ptr<EspecialistaCharacter>")
        .constructor<>()
        ;

    class_<CombatenteCharacter, base<Character>>("CombatenteCharacter")
        .smart_ptr<std::shared_ptr<CombatenteCharacter>>("shared_ptr<CombatenteCharacter>")
        .constructor<>()
        ;
}


EMSCRIPTEN_BINDINGS(maestery_data_generated) {
        function("Combatente_GetSkill",          &Combatente_GetSkill_JS);
    function("Combatente_HasAttributeBonus", &Combatente_HasAttrBonus_JS);
    function("Combatente_GetPeLimit",        &Combatente_GetPeLimit_JS);

    function("Especialista_GetSkill",          &Especialista_GetSkill_JS);
    function("Especialista_HasAttributeBonus", &Especialista_HasAttrBonus_JS);
    function("Especialista_GetPeLimit",        &Especialista_GetPeLimit_JS);

    function("Ocultista_GetSkill",          &Ocultista_GetSkill_JS);
    function("Ocultista_HasAttributeBonus", &Ocultista_HasAttrBonus_JS);
    function("Ocultista_GetPeLimit",        &Ocultista_GetPeLimit_JS);
}