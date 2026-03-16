#ifndef ESPECIALISTACHARACTER_H
#define ESPECIALISTACHARACTER_H

#include "PlayerCharacter.h"
#include "Especialista_Maestery.h"

class EspecialistaCharacter : public Character{
    public:
        EspecialistaCharacter(){
            InitializeClassValue();
        }
         
        void InitializeClassValue() override{
            SetPvBase(16);
            SetPeBase(5);
            SetManaBase(14);
            pvPerLevel = 3;
            pePerLevel = 4;
            manaPerLevel = 4;
            proficienciesAmountBase = 7;
        }

        std::string GetClassName() const override { return "EspecialistaCharacter"; }
std::string GetMaesterySkill(int index) const override {
    auto m = static_cast<EspecialistaData::Maestery_Especialista>(index);
    return EspecialistaData::GetSkill(m);
}

bool GetMaesteryHasAttrBonus(int index) const override {
    auto m = static_cast<EspecialistaData::Maestery_Especialista>(index);
    return EspecialistaData::HasAttributeBonus(m);
}

int GetMaesteryPeLimit(int index) const override {
    auto m = static_cast<EspecialistaData::Maestery_Especialista>(index);
    return std::stoi(EspecialistaData::GetPeLimit(m));
}

};

#endif