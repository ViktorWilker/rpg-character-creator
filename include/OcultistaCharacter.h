#ifndef OCULTISTACHARACTER_H
#define OCULTISTACHARACTER_H

#include "PlayerCharacter.h"
#include "Ocultista_Maestery.h"


class OcultistaCharacter : public Character{
    public:
        OcultistaCharacter(){
            InitializeClassValue();
        }

            void InitializeClassValue() override{
            SetPvBase(12);
            SetPeBase(4);
            SetManaBase(20);
            pvPerLevel = 2;
            pePerLevel = 3;
            manaPerLevel = 5;
            proficienciesAmountBase = 3;
        }

        std::string GetClassName() const override { return "OcultistaCharacter"; }
        std::string GetMaesterySkill(int index) const override {
    auto m = static_cast<OcultistaData::Maestery_Ocultista>(index);
    return OcultistaData::GetSkill(m);
}

bool GetMaesteryHasAttrBonus(int index) const override {
    auto m = static_cast<OcultistaData::Maestery_Ocultista>(index);
    return OcultistaData::HasAttributeBonus(m);
}

int GetMaesteryPeLimit(int index) const override {
    auto m = static_cast<OcultistaData::Maestery_Ocultista>(index);
    return std::stoi(OcultistaData::GetPeLimit(m));
}



};

#endif