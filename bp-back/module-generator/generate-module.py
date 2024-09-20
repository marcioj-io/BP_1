import re
import sys
import os
import pathlib
import argparse
import glob

ABSOLUTE_PATH = pathlib.Path(__file__).parent

class bcolors:
    FAIL = '\033[91m'
    ENDC = '\033[0m'

def generateModule():
  parser = argparse.ArgumentParser()
  parser.add_argument('--module', '-m', help="nome do modulo", type= str)

  if "-h" in sys.argv:
    print(parser.format_help())
    exit(0)

  args = parser.parse_args()

  if not args.module:
    print(parser.format_help())
    print("O nome do modulo é obrigatório")
    exit(1)

  MODULE=str(args.module)

  if "_" in MODULE:
      MODULE = MODULE.replace("_", " ").title().replace(" ", "")
  else:
       MODULE = MODULE.lower()
  
  MODULE_CAMELCASE = MODULE[0].lower() + MODULE[1:] if "_" in str(args.module) else MODULE.lower()
  MODULE_PASCALCASE = MODULE if "_" in str(args.module) else MODULE.title()
  MODULE_KEBABCASE = str(args.module).replace("_", "-").lower() if "_" in str(args.module) else str(args.module).lower()
  
  DOT_CASE = str(args.module).replace("_", ".").lower() if "_" in str(args.module) else str(args.module).lower()
  KEBAB_CASE = str(args.module).replace("_", "-").lower() if "_" in str(args.module) else str(args.module).lower()
  
  PATH = ABSOLUTE_PATH.parent / "src" / "modules" / MODULE_KEBABCASE

  print('🚀 Gerando modulo', MODULE)

  if os.path.exists(PATH):
    print(f"{bcolors.FAIL} O modulo {MODULE} já existe {bcolors.ENDC}")
    exit(0)

  os.makedirs(PATH, exist_ok=True)
  print(f"✅ Pasta {MODULE_KEBABCASE} criada")

  structure_folder = pathlib.Path.cwd() / 'module-generator' / 'structure'

  files = glob.glob(str(structure_folder / '**/*.txt'), recursive=True)

  for file in files:
      with open(file, "r") as f:
          content = f.read()
          content = content.replace("module_cc", MODULE_CAMELCASE)
          content = content.replace("module_dc", DOT_CASE)
          content = content.replace("module_kc", KEBAB_CASE)
          content = content.replace("module_pc", MODULE_PASCALCASE)
          content = content.replace("module_uc", str(args.module).upper())
          content = content.replace("module_url", str(args.module)
                                    .replace("_", "-").lower() 
                                        if "_" in str(args.module) 
                                    else str(args.module).lower())
          filename = pathlib.Path(file).name.replace('.txt', '.ts')
          
          # Nome do arquivo
          result_filename = f"{KEBAB_CASE}.{filename}"
          
          
          folder = ""

          if "entity" in filename or "type" in filename:
              folder = "entity"
              (PATH / folder).mkdir(parents=True, exist_ok=True)
          elif "dto" in filename or "pagination" in filename:
              folder_mapping = {
                  "dto.ts": "dto/response",
                  "dto.prisma.ts": "dto/type",
                  "pagination.response.ts": "dto/response",
                  "create.dto.ts": "dto/request",
                  "update.dto.ts": "dto/request",
              }

              folder = folder_mapping.get(filename, "dto/type")
                
              (PATH / folder).mkdir(parents=True, exist_ok=True)
              
          elif "test" in filename:
            TESTS_PATH = ''
            if "fixture" in filename or "utils" in filename:
              TESTS_PATH = pathlib.Path(ABSOLUTE_PATH.parent.resolve()) / "tests" / "fixtures" / MODULE_KEBABCASE
            else:
              TESTS_PATH = pathlib.Path(ABSOLUTE_PATH.parent.resolve()) / "tests" 
                             
            TESTS_PATH.mkdir(parents=True, exist_ok=True)
            filename = result_filename.replace('test.', '')
            file_path = TESTS_PATH / filename

            
            if not file_path.exists():  # Check if file does not exist
                with open(file_path, "x") as f:
                    f.write(content)
                    print(f"✅ Arquivo {filename} criado")
            else:
                print(f"❌ Arquivo {filename} já existe")
            continue

          with open(PATH / folder / result_filename, "x") as f:
              f.write(content)
              if folder:
                  print(f"✅ Arquivo {folder}/{result_filename} criado")
              else:
                  print(f"✅ Arquivo {result_filename} criado")


  insertNewModuleInAppModule(MODULE_KEBABCASE, ABSOLUTE_PATH)
  
  
def insertNewModuleInAppModule(MODULE_NAME: str, ABSOLUTE_PATH: str):
    
    # Caminho para app.module.ts
    APP_MODULE_PATH = ABSOLUTE_PATH.parent / "src" / "app.module.ts"

    with open(APP_MODULE_PATH, "r") as file:
        content = file.read()

    new_import = f"import {{ {MODULE_NAME}Module }} from './modules/{MODULE_NAME}/{MODULE_NAME.lower()}.module';\n"
    content = f"{new_import}{content}"

    pattern = re.compile(r'(imports: \[(?:(?!imports: \[)[\s\S])*\])')
    matches = pattern.findall(content)

    if matches:
        last_imports = matches[-1]
        last_bracket_position = last_imports.rfind("]")
        if last_bracket_position != -1:
            new_imports = (last_imports[:last_bracket_position] + f" {MODULE_NAME}Module" + last_imports[last_bracket_position:])
            new_content = content.replace(matches[-1], new_imports)

            with open(APP_MODULE_PATH, "w") as file:
                file.write(new_content)

            print(f"✅ {MODULE_NAME}Module foi adicionado ao AppModule.")
        else:
            print("❌ Não foi possível encontrar o fechamento do array de imports.")
    else:
        print("❌ Não foi possível encontrar o array de imports no AppModule.")

if __name__ == "__main__":
    generateModule()