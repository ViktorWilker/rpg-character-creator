
#pragma once
#include <string>

enum class Attribute {
    Strength, Agility, Intellect, Presence, Vigor
};

// Funcao auxiliar (para fins de JSON e debug)
inline std::string ToString(Attribute attr) {
    switch (attr) {
        case Attribute::Agility: return "Agility";
        case Attribute::Strength: return "Strength";
        case Attribute::Intellect: return "Intellect";
        case Attribute::Presence: return "Presence";
        case Attribute::Vigor: return "Vigor";
        default: return "Unknown";
    }
}