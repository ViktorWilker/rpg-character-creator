#ifndef COMBATENTECHARACTER_H
#define COMBATENTECHARACTER_H

#include "PlayerCharacter.h"

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
};

#endif