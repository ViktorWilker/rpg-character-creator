#ifndef OCULTISTACHARACTER_H
#define OCULTISTACHARACTER_H

#include "PlayerCharacter.h"

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
};

#endif