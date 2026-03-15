#pragma once
#include <string>

enum class Proficiency{
    Acrobacia,Adestramento,Arcano,
    Artes,Atletismo,Atualidades,
    Ciencias,Crime,Diplomacia,
    Enganacao,Fortitude,Furtividade,
    Iniciativa,Intimidacao,Intuicao,
    Investigacao,Luta,Medicina,
    Percepcao,Pilotagem,Pontaria,
    Profissao,Reflexos,Religiao,
    Sobrevivencia,Tatica,Tecnologia,Vontade
};

inline std::string ToString(Proficiency prof) {
    switch (prof) {
        case Proficiency::Acrobacia: return "Acrobacia";
        case Proficiency::Adestramento: return "Adestramento";
        case Proficiency::Arcano: return "Arcano";
        case Proficiency::Artes: return "Artes";
        case Proficiency::Atletismo: return "Atletismo";
        case Proficiency::Atualidades: return "Atualidades";
        case Proficiency::Ciencias: return "Ciencias";
        case Proficiency::Crime: return "Crime";
        case Proficiency::Diplomacia: return "Diplomacia";
        case Proficiency::Enganacao: return "Enganacao";
        case Proficiency::Fortitude: return "Fortitude";
        case Proficiency::Furtividade: return "Furtividade";
        case Proficiency::Iniciativa: return "Iniciativa";
        case Proficiency::Intimidacao: return "Intimidacao";
        case Proficiency::Intuicao: return "Intuicao";
        case Proficiency::Investigacao: return "Investigacao";
        case Proficiency::Luta: return "Luta";
        case Proficiency::Medicina: return "Medicina";
        case Proficiency::Percepcao: return "Percepcao";
        case Proficiency::Pilotagem: return "Pilotagem";
        case Proficiency::Pontaria: return "Pontaria";
        case Proficiency::Profissao: return "Profissao";
        case Proficiency::Reflexos: return "Reflexos";
        case Proficiency::Religiao: return "Religiao";
        case Proficiency::Sobrevivencia: return "Sobrevivencia";
        case Proficiency::Tatica: return "Tatica";
        case Proficiency::Tecnologia: return "Tecnologia";
        case Proficiency::Vontade: return "Vontade";
        default: return "Unknown_Proficiency";
    }
}