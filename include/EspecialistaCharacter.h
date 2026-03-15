#ifndef ESPECIALISTACHARACTER_H
#define ESPECIALISTACHARACTER_H

#include "PlayerCharacter.h"

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
};

#endif