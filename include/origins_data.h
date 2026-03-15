#ifndef ORIGINS_DATA_H
#define ORIGINS_DATA_H

#include <string>
#include <vector>
#include <map>
#include <fstream>
#include <stdexcept>
#include "nlohmann/json.hpp"

using json = nlohmann::json;

struct Poder {
    std::string nome;
    std::string descricao;
};

struct OrigemData {
    std::string id;
    std::string nome;
    std::vector<std::string> pericias;     
    int pericias_livres = 0;               
    std::string pericias_nota;            
    Poder poder;
};

struct ClasseData {
    int pv_base        = 0;
    int pe_base        = 0;
    int mana_base      = 0;
    std::vector<std::vector<std::string>> pericias_fixas_escolha;
    std::vector<std::string> pericias_fixas;
    int pericias_livres  = 0;
    int pericias_por_int = 1;
};

class OrigensDB {
private:
    json _data;
    std::map<std::string, OrigemData> _origens;
    std::map<std::string, ClasseData> _classes;
    bool _loaded = false;

    std::string _path = "data/origins.json";

public:
    OrigensDB() {
        Load(_path);
    }

    explicit OrigensDB(const std::string& path) {
        Load(path);
    }

    void Load(const std::string& path) {
        std::ifstream file(path);
        if (!file.is_open()) {
            throw std::runtime_error("OrigensDB: nao foi possivel abrir " + path);
        }

        file >> _data;
        _loaded = true;

        for (const auto& o : _data["origens"]) {
            OrigemData origem;
            origem.id   = o.value("id", "");
            origem.nome = o.value("nome", "");

            if (o.contains("pericias") && o["pericias"].is_array()) {
                for (const auto& p : o["pericias"]) {
                    origem.pericias.push_back(p.get<std::string>());
                }
            }
            origem.pericias_livres = o.value("pericias_livres", 0);
            origem.pericias_nota   = o.value("pericias_nota", "");

            if (o.contains("poder")) {
                origem.poder.nome      = o["poder"].value("nome", "");
                origem.poder.descricao = o["poder"].value("descricao", "");
            }

            _origens[origem.id] = origem;
        }

        for (auto it = _data["classes"].begin(); it != _data["classes"].end(); ++it) {
            ClasseData classe;
            const auto& c = it.value();

            classe.pv_base        = c.value("pv_base", 0);
            classe.pe_base        = c.value("pe_base", 0);
            classe.mana_base      = c.value("mana_base", 0);
            classe.pericias_livres   = c.value("pericias_livres", 0);
            classe.pericias_por_int  = c.value("pericias_por_int", 1);

            if (c.contains("pericias_fixas_escolha")) {
                for (const auto& grupo : c["pericias_fixas_escolha"]) {
                    std::vector<std::string> opcoes;
                    for (const auto& op : grupo) {
                        opcoes.push_back(op.get<std::string>());
                    }
                    classe.pericias_fixas_escolha.push_back(opcoes);
                }
            }

            if (c.contains("pericias_fixas")) {
                for (const auto& p : c["pericias_fixas"]) {
                    classe.pericias_fixas.push_back(p.get<std::string>());
                }
            }

            _classes[it.key()] = classe;
        }
    }

    OrigemData GetOrigem(const std::string& id) const {
        auto it = _origens.find(id);
        if (it == _origens.end()) {
            throw std::runtime_error("OrigensDB: origem nao encontrada: " + id);
        }
        return it->second;
    }

    std::vector<std::string> GetPericiasDaOrigem(const std::string& id) const {
        return GetOrigem(id).pericias;
    }

    Poder GetPoderDaOrigem(const std::string& id) const {
        return GetOrigem(id).poder;
    }

    bool OrigemTemPericiaLivre(const std::string& id) const {
        return GetOrigem(id).pericias_livres > 0;
    }

    std::vector<std::string> ListarOrigens() const {
        std::vector<std::string> ids;
        for (const auto& pair : _origens) {
            ids.push_back(pair.first);
        }
        return ids;
    }

    ClasseData GetClasse(const std::string& nome) const {
        auto it = _classes.find(nome);
        if (it == _classes.end()) {
            throw std::runtime_error("OrigensDB: classe nao encontrada: " + nome);
        }
        return it->second;
    }

    int GetTotalPericasLivres(const std::string& classe, int int_score) const {
        const ClasseData& c = GetClasse(classe);
        return c.pericias_livres + (int_score * c.pericias_por_int);
    }

    std::vector<std::vector<std::string>> GetEscolhasObrigatorias(const std::string& classe) const {
        return GetClasse(classe).pericias_fixas_escolha;
    }

    std::vector<std::string> GetPericasFixasDaClasse(const std::string& classe) const {
        return GetClasse(classe).pericias_fixas;
    }

    bool IsDuplicata(const std::string& pericia,
                     const std::vector<std::string>& lista) const {
        for (const auto& p : lista) {
            if (p == pericia) return true;
        }
        return false;
    }

    std::string AplicarDuplicata(const std::string& pericia,
                                 const std::vector<std::string>& lista) const {
        std::string regra = _data.value("pericias_duplicada", "ignorar");
        if (regra == "veterano" && IsDuplicata(pericia, lista)) {
            return pericia + "_veterano";
        }
        return pericia;
    }
};

inline OrigensDB& GetOrigensDB() {
    static OrigensDB instance;
    return instance;
}

#endif 