// ARQUIVO GERADO AUTOMATICAMENTE POR SCRIPT PYTHON.
// NÃO EDITE MANUALMENTE. EDITE O JSON: maestery_Especialista.json

#pragma once

#include <string>

namespace EspecialistaData {

    // Enumeração de Níveis de Maestria para Especialista
    enum class Maestery_Especialista {
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

    inline std::string ToString(Maestery_Especialista m) {
        switch (m) {
            case Maestery_Especialista::M_5: return "5%";
            case Maestery_Especialista::M_10: return "10%";
            case Maestery_Especialista::M_15: return "15%";
            case Maestery_Especialista::M_20: return "20%";
            case Maestery_Especialista::M_25: return "25%";
            case Maestery_Especialista::M_30: return "30%";
            case Maestery_Especialista::M_35: return "35%";
            case Maestery_Especialista::M_40: return "40%";
            case Maestery_Especialista::M_45: return "45%";
            case Maestery_Especialista::M_50: return "50%";
            case Maestery_Especialista::M_55: return "55%";
            case Maestery_Especialista::M_60: return "60%";
            case Maestery_Especialista::M_65: return "65%";
            case Maestery_Especialista::M_70: return "70%";
            case Maestery_Especialista::M_75: return "75%";
            case Maestery_Especialista::M_80: return "80%";
            case Maestery_Especialista::M_85: return "85%";
            case Maestery_Especialista::M_90: return "90%";
            case Maestery_Especialista::M_95: return "95%";
            case Maestery_Especialista::M_99: return "99%";
            default: return "Unknown";
        }
    }

    inline std::string GetSkill(Maestery_Especialista m) {
        switch (m) {
            case Maestery_Especialista::M_5: return "Eclético, Perito(2Pe, +1d6)";
            case Maestery_Especialista::M_10: return "Habilidade de Trilha";
            case Maestery_Especialista::M_15: return "Poder de Especialista";
            case Maestery_Especialista::M_20: return "Aumento de Atributo";
            case Maestery_Especialista::M_25: return "Perito (3PE, +1d8)";
            case Maestery_Especialista::M_30: return "Poder de Especialista";
            case Maestery_Especialista::M_35: return "Grau de Treinamento";
            case Maestery_Especialista::M_40: return "Engenhosidade(veterano), Habilidade de Trilha";
            case Maestery_Especialista::M_45: return "Poder de Especialista";
            case Maestery_Especialista::M_50: return "Aumento de Atributo, versatilidade";
            case Maestery_Especialista::M_55: return "Perito (4PE, +1d10)";
            case Maestery_Especialista::M_60: return "Poder de Especialista";
            case Maestery_Especialista::M_65: return "Habilidade de Trilha";
            case Maestery_Especialista::M_70: return "Grau de Treinamento";
            case Maestery_Especialista::M_75: return "Engenhosidade(Expert), Poder de Especialista";
            case Maestery_Especialista::M_80: return "Aumento de Atributo";
            case Maestery_Especialista::M_85: return "Perito (5PE, +1d12)";
            case Maestery_Especialista::M_90: return "Poder de Especialista";
            case Maestery_Especialista::M_95: return "Aumento de Atributo";
            case Maestery_Especialista::M_99: return "Habilidade de Trilha";
            default: return "";
        }
    }

    inline std::string GetPeLimit(Maestery_Especialista m) {
        switch (m) {
            case Maestery_Especialista::M_5: return "1";
            case Maestery_Especialista::M_10: return "2";
            case Maestery_Especialista::M_15: return "3";
            case Maestery_Especialista::M_20: return "4";
            case Maestery_Especialista::M_25: return "5";
            case Maestery_Especialista::M_30: return "6";
            case Maestery_Especialista::M_35: return "7";
            case Maestery_Especialista::M_40: return "8";
            case Maestery_Especialista::M_45: return "9";
            case Maestery_Especialista::M_50: return "10";
            case Maestery_Especialista::M_55: return "11";
            case Maestery_Especialista::M_60: return "12";
            case Maestery_Especialista::M_65: return "13";
            case Maestery_Especialista::M_70: return "14";
            case Maestery_Especialista::M_75: return "15";
            case Maestery_Especialista::M_80: return "16";
            case Maestery_Especialista::M_85: return "17";
            case Maestery_Especialista::M_90: return "18";
            case Maestery_Especialista::M_95: return "19";
            case Maestery_Especialista::M_99: return "20";
            default: return "0";
        }
    }

    // Retorna true se este nível concede aumento de atributo
    inline bool HasAttributeBonus(Maestery_Especialista m) {
        switch (m) {
            case Maestery_Especialista::M_20: return true;
            case Maestery_Especialista::M_50: return true;
            case Maestery_Especialista::M_80: return true;
            case Maestery_Especialista::M_95: return true;
            default: return false;
        }
    }

} // namespace EspecialistaData
