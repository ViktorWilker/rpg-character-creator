// ARQUIVO GERADO AUTOMATICAMENTE POR SCRIPT PYTHON.
// NÃO EDITE MANUALMENTE. EDITE O JSON: maestery_Combatente.json

#pragma once

#include <string>

namespace CombatenteData {

    // Enumeração de Níveis de Maestria para Combatente
    enum class Maestery_Combatente {
        M_5, // 5%
        M_10, // 10%
        M_15, // 15%
        M_20, // 20%
        M_25, // 25%
        M_30, // 30%
        M_35, // 35%
        M_40, // 40%
        M_45, // 45%
        M_50, // 50%
        M_55, // 55%
        M_60, // 60%
        M_65, // 65%
        M_70, // 70%
        M_75, // 75%
        M_80, // 80%
        M_85, // 85%
        M_90, // 90%
        M_95, // 95%
        M_99, // 99%
    };

    inline std::string ToString(Maestery_Combatente m) {
        switch (m) {
            case Maestery_Combatente::M_5: return "5%";
            case Maestery_Combatente::M_10: return "10%";
            case Maestery_Combatente::M_15: return "15%";
            case Maestery_Combatente::M_20: return "20%";
            case Maestery_Combatente::M_25: return "25%";
            case Maestery_Combatente::M_30: return "30%";
            case Maestery_Combatente::M_35: return "35%";
            case Maestery_Combatente::M_40: return "40%";
            case Maestery_Combatente::M_45: return "45%";
            case Maestery_Combatente::M_50: return "50%";
            case Maestery_Combatente::M_55: return "55%";
            case Maestery_Combatente::M_60: return "60%";
            case Maestery_Combatente::M_65: return "65%";
            case Maestery_Combatente::M_70: return "70%";
            case Maestery_Combatente::M_75: return "75%";
            case Maestery_Combatente::M_80: return "80%";
            case Maestery_Combatente::M_85: return "85%";
            case Maestery_Combatente::M_90: return "90%";
            case Maestery_Combatente::M_95: return "95%";
            case Maestery_Combatente::M_99: return "99%";
            default: return "Unknown";
        }
    }

    inline std::string GetSkill(Maestery_Combatente m) {
        switch (m) {
            case Maestery_Combatente::M_5: return "Ataque Especial (2PE, +5)";
            case Maestery_Combatente::M_10: return "Habilidade de Trilha";
            case Maestery_Combatente::M_15: return "Poder de Combatente";
            case Maestery_Combatente::M_20: return "Aumento de Atributo";
            case Maestery_Combatente::M_25: return "Ataque Especial (3PE, +10)";
            case Maestery_Combatente::M_30: return "Poder de Combatente";
            case Maestery_Combatente::M_35: return "Grau de Treinamento";
            case Maestery_Combatente::M_40: return "Habilidade de Trilha";
            case Maestery_Combatente::M_45: return "Poder de Combatente";
            case Maestery_Combatente::M_50: return "Aumento de Atributo, versatilidade";
            case Maestery_Combatente::M_55: return "Ataque Especial (4PE, +15)";
            case Maestery_Combatente::M_60: return "Poder de Combatente";
            case Maestery_Combatente::M_65: return "Habilidade de Trilha";
            case Maestery_Combatente::M_70: return "Grau de Treinamento";
            case Maestery_Combatente::M_75: return "Poder de Combatente";
            case Maestery_Combatente::M_80: return "Aumento de Atributo";
            case Maestery_Combatente::M_85: return "Ataque Especial (5PE, +20)";
            case Maestery_Combatente::M_90: return "Poder de Combatente";
            case Maestery_Combatente::M_95: return "Aumento de Atributo";
            case Maestery_Combatente::M_99: return "Habilidade de Trilha";
            default: return "";
        }
    }

    inline std::string GetPeLimit(Maestery_Combatente m) {
        switch (m) {
            case Maestery_Combatente::M_5: return "1";
            case Maestery_Combatente::M_10: return "2";
            case Maestery_Combatente::M_15: return "3";
            case Maestery_Combatente::M_20: return "4";
            case Maestery_Combatente::M_25: return "5";
            case Maestery_Combatente::M_30: return "6";
            case Maestery_Combatente::M_35: return "7";
            case Maestery_Combatente::M_40: return "8";
            case Maestery_Combatente::M_45: return "9";
            case Maestery_Combatente::M_50: return "10";
            case Maestery_Combatente::M_55: return "11";
            case Maestery_Combatente::M_60: return "12";
            case Maestery_Combatente::M_65: return "13";
            case Maestery_Combatente::M_70: return "14";
            case Maestery_Combatente::M_75: return "15";
            case Maestery_Combatente::M_80: return "16";
            case Maestery_Combatente::M_85: return "17";
            case Maestery_Combatente::M_90: return "18";
            case Maestery_Combatente::M_95: return "19";
            case Maestery_Combatente::M_99: return "20";
            default: return "0";
        }
    }

    // Retorna true se este nível concede aumento de atributo
    inline bool HasAttributeBonus(Maestery_Combatente m) {
        switch (m) {
            case Maestery_Combatente::M_20: return true;
            case Maestery_Combatente::M_50: return true;
            case Maestery_Combatente::M_80: return true;
            case Maestery_Combatente::M_95: return true;
            default: return false;
        }
    }

} // namespace CombatenteData
