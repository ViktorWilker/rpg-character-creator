import json
import re
import os

# CAMINHOS RELATIVOS À RAIZ DO PROJETO
# Se rodar "python scripts/generate_origins.py", ele vai procurar nestas pastas:
input_file = "data/origins.json" 
output_file = "include/origins.h"

def sanitize_identifier(name):
    name = name.strip()
    name = re.sub(r'ç', 'c', name, flags=re.IGNORECASE)
    name = re.sub(r'[áàãâ]', 'a', name, flags=re.IGNORECASE)
    name = re.sub(r'[éèê]', 'e', name, flags=re.IGNORECASE)
    name = re.sub(r'[íìî]', 'i', name, flags=re.IGNORECASE)
    name = re.sub(r'[óòõô]', 'o', name, flags=re.IGNORECASE)
    name = re.sub(r'[úùû]', 'u', name, flags=re.IGNORECASE)
    name = re.sub(r'[^\w\s]', '', name)
    name = re.sub(r'\s+', '_', name)
    return name

def generate_code(json_data):
    code = (
        "// ARQUIVO GERADO AUTOMATICAMENTE PELO PYTHON\n"
        "#pragma once\n"
        "#include <string>\n"
        "#ifdef __EMSCRIPTEN__\n"
        "#include <emscripten/bind.h>\n"
        "#endif\n\n"
        "enum class Origens {\n"
    )

    # Enum
    for name in json_data.keys():
        identifier = sanitize_identifier(name)
        code += f"    {identifier}, // {name}\n"
    code += "};\n\n"

    # ToString
    code += "inline std::string ToString(Origens origem) {\n    switch(origem) {\n"
    for name in json_data.keys():
        identifier = sanitize_identifier(name)
        code += f"        case Origens::{identifier}: return \"{name}\";\n"
    code += "        default: return \"Desconhecido\";\n    }\n}\n\n"

    # GetPericias
    code += "inline std::string GetPericias(Origens origem) {\n    switch(origem) {\n"
    for name, data in json_data.items():
        identifier = sanitize_identifier(name)
        pericias = ", ".join(data.get("pericias", []))
        code += f"        case Origens::{identifier}: return \"{pericias}\";\n"
    code += "        default: return \"\";\n    }\n}\n\n"

    # GetPoder
    code += "inline std::string GetPoder(Origens origem) {\n    switch(origem) {\n"
    for name, data in json_data.items():
        identifier = sanitize_identifier(name)
        poder = data.get("Poder", "")
        code += f"        case Origens::{identifier}: return \"{poder}\";\n"
    code += "        default: return \"\";\n    }\n}\n\n"

    return code

# LÓGICA DE LEITURA DO ARQUIVO
# Verifica se o arquivo de entrada existe antes de tentar abrir
if not os.path.exists(input_file):
    print(f"ERRO: Não encontrei o arquivo {input_file}")
    print("Certifique-se de rodar o script a partir da RAIZ do projeto (ex: python scripts/generate_origins.py)")
else:
    with open(input_file, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    full_code = generate_code(json_data)

    # Garante que a pasta include existe
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(full_code)

    print(f"Sucesso! {output_file} gerado com base em {input_file}.")