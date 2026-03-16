#ifndef PLAYERCHARACTER_H
#define PLAYERCHARACTER_H

#include <string>
#include <map>
#include <iostream>
#include <vector>
#include <algorithm>
#include "attribute.h"
#include "proficiencies.h"
#include "origins_data.h"
#include "nlohmann/json.hpp"

enum class CharacterClass {
    Combatente   = 0,
    Especialista = 1,
    Ocultista    = 2
};

struct MaesteryUpResult {
    int         novoNivel;
    std::string novoNivelStr;
    int         pvGanho;
    int         peGanho;
    int         manaGanho;
    int         novoLimitePe;
    std::string habilidade;
    bool        temAumentoAtributo;
    bool        temGrauTreinamento;
    bool        temVersatilidade;
};

class Character {
protected:
    int pvPerLevel   = 0;
    int pePerLevel   = 0;
    int manaPerLevel = 0;
    int proficienciesAmountBase = 0;

private:
    std::map<Attribute, int> _attributes = {
        {Attribute::Agility,   1},
        {Attribute::Strength,  1},
        {Attribute::Intellect, 1},
        {Attribute::Presence,  1},
        {Attribute::Vigor,     1}
    };

    std::vector<Proficiency> proficiencies;

    std::string name;
    std::string origin;
    std::string originNome;
    std::string originPoder;
    std::string originPoderDesc;

    int pv      = 0;
    int _pvBase = 0;

    int pe      = 0;
    int _peBase = 0;

    int mana      = 0;
    int _manaBase = 0;

    int corruption      = 0;
    int defValue        = 0;

    int maestery        = 5;
    int maesteryIndex   = 0;   
    int peLimitPerRound = 1;   

public:
    Character() = default;
    virtual void InitializeClassValue() {};
    virtual ~Character() = default;
    virtual std::string GetClassName() const { return "Character"; }

    virtual std::string GetMaesterySkill(int index) const { return ""; }
    virtual bool        GetMaesteryHasAttrBonus(int index) const { return false; }
    virtual int         GetMaesteryPeLimit(int index) const { return index + 1; }

    int age = 25;

    // ------------------------------------------------
    // ATRIBUTOS
    // ------------------------------------------------
    int  GetAttributeValue(Attribute attribute) const;
    void SetAttributeValue(Attribute attribute, int Value);
    void SetAllAttributesValue(int agi, int str, int inte, int pre, int vig);

    // ------------------------------------------------
    // NOME
    // ------------------------------------------------
    void        SetName(const std::string& name);
    std::string GetName() const;

    // ------------------------------------------------
    // ORIGEM
    // ------------------------------------------------
    void        SetOrigin(const std::string& originId);
    std::string GetOrigin()          const;
    std::string GetOriginId()        const;
    std::string GetOriginPoder()     const;
    std::string GetOriginPoderDesc() const;

    // ------------------------------------------------
    // CORRUPÇÃO
    // ------------------------------------------------
    void SetCorruptionValue(int value);
    void IncrementCorruptionValue(int value);
    int  GetCorruptionValue() const;

    // ------------------------------------------------
    // DEFESA
    // ------------------------------------------------
    void SetDefValue(int value);
    void AddDefValue(int value);
    int  GetDefValue() const;

    // ------------------------------------------------
    // PV
    // ------------------------------------------------
    void SetPvBase(int value);
    void SetPv(int value);
    void CalculateInitialPv();
    void UpdatePv(int val);
    void DecrementPv();
    int  GetPvBase() const;
    int  GetPv()     const;

    // ------------------------------------------------
    // PE (Estamina)
    // ------------------------------------------------
    void SetPeBase(int value);
    void SetPe(int value);
    void DecrementPe();
    void CalculateInitialPe();
    void UpdatePe(int val);
    int  GetPeBase()  const;
    int  GetPe()      const;
    int  GetPeLimit() const;

    // ------------------------------------------------
    // MANA
    // ------------------------------------------------
    void SetManaBase(int value);
    void SetMana(int value);
    void DecrementMana();
    void CalculateInitialMana();
    void UpdateMana(int val);
    int  GetManaBase() const;
    int  GetMana()     const;

    // ------------------------------------------------
    // PROFICIÊNCIAS
    // ------------------------------------------------
    void AddProficiecys(Proficiency Lproficiency);
    void AddProficiencyByName(const std::string& nome);
    int  CalculateProficiesAmount();
    std::vector<Proficiency> GetProficies();

    // ------------------------------------------------
    // MAESTRIA
    // ------------------------------------------------
    int         GetMaestery()      const;
    std::string GetMaesteryStr()   const;
    int         GetMaesteryIndex() const;
    void        SetMaestery(int value);


    int CalculatePvGain()   const;
    int CalculatePeGain()   const;
    int CalculateManaGain() const;


    std::string MaesteryUp();

    void UpdateStatsValue(int pvval, int peval, int manaval);

    std::string ToJson()  const;
    void        FromJson(const std::string& jsonString);
};

#endif