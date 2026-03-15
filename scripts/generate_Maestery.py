import json
import re
import sys
import os

# --- CONFIGURAÇÃO ---
# Se quiser que o script imprima logs, mude para True
VERBOSE = True

def log(msg):
    if VERBOSE: print(f"[Generator] {msg}")

# Recebe o caminho dos arquivos via argumentos
if len(sys.argv) < 4:
    print("Uso: python Generate_Maestery_Enum.py <input_json> <output_header> <classe_nome>")
    print("Exemplo: python Generate_Maestery_Enum.py data/Ocultista.json include/Ocultista_Maestery.h Ocultista")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]
classe_nome = sys.argv[3] # Ex: Ocultista, Combatente

if not os.path.exists(input_file):
    print(f"ERRO: Arquivo JSON não encontrado: {input_file}")
    sys.exit(1)

# --- Sanitização de identificadores ---
def sanitize_identifier(name):
    """
    Limpa e converte nomes de Maestery (Ex: '5%') em identificadores C++ (Ex: 'M_5').
    """
    name = name.strip()
    name = re.sub(r"%", "", name) 
    name = re.sub(r"[^\w\s]", "", name)
    name = re.sub(r"\s+", "_", name)
    # Mapeamento simples de acentos se necessário, mas para números 'M_' resolve
    return f"M_{name}"

# --- Gerador do Header ---
def generate_header_content(json_data, class_name):
    # 1. Definições de Nomes
    namespace_name = f"{class_name}Data"
    enum_name = f"Maestery_{class_name}"
    
    # Cabeçalho do Arquivo
    content = (
        f"// ARQUIVO GERADO AUTOMATICAMENTE POR SCRIPT PYTHON.\n"
        f"// NÃO EDITE MANUALMENTE. EDITE O JSON: {os.path.basename(input_file)}\n\n"
        f"#pragma once\n\n"
        f"#include <string>\n\n"
        f"namespace {namespace_name} {{\n\n"
        f"    // Enumeração de Níveis de Maestria para {class_name}\n"
        f"    enum class {enum_name} {{\n"
    )

    # Corpo do Enum
    # Ordenar chaves se possível, assumindo formato "5%", "10%"...
    def sort_key(k):
        try:
            return int(k.replace('%', ''))
        except:
            return 0
            
    sorted_keys = sorted(json_data.keys(), key=sort_key)

    for name in sorted_keys:
        identifier = sanitize_identifier(name)
        content += f"        {identifier}, // {name}\n"
    
    content += "    };\n\n"

    # ----------------------------------------------------
    # Funções Auxiliares
    # ----------------------------------------------------

    # 1. ToString
    content += f"    inline std::string ToString({enum_name} m) {{\n"
    content += f"        switch (m) {{\n"
    for name in sorted_keys:
        identifier = sanitize_identifier(name)
        content += f"            case {enum_name}::{identifier}: return \"{name}\";\n"
    content += "            default: return \"Unknown\";\n"
    content += "        }\n    }\n\n"

    # 2. GetSkill
    content += f"    inline std::string GetSkill({enum_name} m) {{\n"
    content += f"        switch (m) {{\n"
    for name in sorted_keys:
        identifier = sanitize_identifier(name)
        raw_skill = json_data[name].get("Skill", "")
        # Escapar aspas duplas para C++
        escaped_skill = raw_skill.replace('"', '\\"')
        content += f"            case {enum_name}::{identifier}: return \"{escaped_skill}\";\n"
    content += "            default: return \"\";\n"
    content += "        }\n    }\n\n"

    # 3. GetPeLimit
    content += f"    inline std::string GetPeLimit({enum_name} m) {{\n"
    content += f"        switch (m) {{\n"
    for name in sorted_keys:
        identifier = sanitize_identifier(name)
        pe = json_data[name].get("pe limit", "0")
        content += f"            case {enum_name}::{identifier}: return \"{pe}\";\n"
    content += "            default: return \"0\";\n"
    content += "        }\n    }\n\n"

    # 4. HasAttributeBonus (A MÁGICA ACONTECE AQUI)
    # O Python verifica o texto agora, o C++ só retorna true/false rápido.
    content += f"    // Retorna true se este nível concede aumento de atributo\n"
    content += f"    inline bool HasAttributeBonus({enum_name} m) {{\n"
    content += f"        switch (m) {{\n"
    
    has_any_bonus = False
    for name in sorted_keys:
        skill_text = json_data[name].get("Skill", "").lower()
        identifier = sanitize_identifier(name)
        
        # Verifica se tem "aumento de atributo" no texto
        if "aumento de atributo" in skill_text:
            content += f"            case {enum_name}::{identifier}: return true;\n"
            has_any_bonus = True
            
    if not has_any_bonus:
        content += "            // Nenhum nível concede bonus neste JSON\n"
        
    content += "            default: return false;\n"
    content += "        }\n    }\n"

    # Fechar Namespace
    content += f"\n}} // namespace {namespace_name}\n"

    return content

# --- Execução Principal ---
try:
    log(f"Lendo JSON: {input_file}")
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    log("Gerando código C++...")
    header_code = generate_header_content(data, classe_nome)

    # Cria diretório se não existir
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(header_code)

    log(f"SUCESSO! Arquivo gerado em: {output_file}")
    print(f"Namespace gerado: {classe_nome}Data")

except Exception as e:
    print(f"ERRO FATAL: {e}")
    sys.exit(1)