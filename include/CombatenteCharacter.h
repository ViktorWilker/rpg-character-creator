#ifndef COMBATENTECHARACTER_H
#define COMBATENTECHARACTER_H

#include "PlayerCharacter.h"
#include "Combatente_Maestery.h"

class CombatenteCharacter : public Character{
    public:
        CombatenteCharacter(){
            InitializeClassValue();
        }

        void InitializeClassValue() override{
            SetPvBase(20);
            SetPeBase(5);
            SetManaBase(10);
            pvPerLevel = 4;
            pePerLevel = 5;
            manaPerLevel = 3;
            proficienciesAmountBase = 1;
            
        }

        std::string GetClassName() const override { return "CombatenteCharacter"; }
        std::string GetMaesterySkill(int index) const override {
    auto m = static_cast<CombatenteData::Maestery_Combatente>(index);
    return CombatenteData::GetSkill(m);
}

bool GetMaesteryHasAttrBonus(int index) const override {
    auto m = static_cast<CombatenteData::Maestery_Combatente>(index);
    return CombatenteData::HasAttributeBonus(m);
}

int GetMaesteryPeLimit(int index) const override {
    auto m = static_cast<CombatenteData::Maestery_Combatente>(index);
    return std::stoi(CombatenteData::GetPeLimit(m));
}

};

#endif