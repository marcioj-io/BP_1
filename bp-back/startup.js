/**
 * List of available modules in the project.
 * @type {string[]}
 */
const projectModules = [
  'Terraform',
  'Cache',
  'Axios',
  'PDF Creator (Puppeteer)',
  'Excel Generator',
  'QR Code Generator',
  'Docker Compose (Dev)',
];

/**
 * Executes a shell command.
 * @param {string} command - The command to be executed.
 */
async function executeCommand(command) {
  const exec = await import('child_process').then(m => m.exec);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o comando: ${command}`, error);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

/**
 * Changes the project name by replacing all occurrences of a specific string.
 * @param {string} projectName - New project name.
 */
async function changeProjectName(projectName) {
  const fs = await import('fs');
  const path = await import('path');

  const directoryPath = path.join(__dirname);

  /**
   * Processes an individual file read by the script. This function reads the file content,
   * replaces all occurrences of a specific string ('nest-api') with the current project name ('projectName'),
   * and rewrites the file with the updated content.
   * Files named 'startup.js' are ignored and not processed.
   *
   * @param {string} filePath - The path of the file to be processed.
   */
  const processFile = filePath => {
    if (filePath.includes('startup.js')) {
      return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error in process file', err);
        return;
      }

      const result = data.replace(/nest-api/g, projectName);

      fs.writeFile(filePath, result, 'utf8', err => {
        if (err) console.error('Error in writing file', err);
      });
    });
  };

  /**
   * Reads files from a specified directory recursively. This function
   * ignores specific directories listed in `ignoreDirs` and processes all other
   * files found in directories and subdirectories. For each file found,
   * the `processFile` function is called.
   *
   * @param {string} dir - The path of the directory to be read.
   */
  const readFilesRecursively = dir => {
    const ignoreDirs = ['node_modules', 'coverage', 'dist', '.git'];

    if (
      ignoreDirs.some(ignoreDir =>
        dir.includes(path.join(__dirname, ignoreDir)),
      )
    ) {
      return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        readFilesRecursively(filePath);
      } else {
        processFile(filePath);
      }
    });
  };

  readFilesRecursively(directoryPath);
}

var finalizeCommands = [];
var success = false;

/**
 * Initializes the project setup process.
 */
async function start() {
  const inquirer = (await import('inquirer')).default;

  const questions = [];

  questionSetProjectName(questions);
  questionsSetModules(questions);

  inquirer
    .prompt(questions)
    .then(async answers => {
      console.log(`Project name: ${answers.projectName}`);

      if (answers.modules) {
        console.log(`Selected modules:\n${answers.modules.join('\n')}`);
      }

      await removeModules(answers.modules);
      await changeProjectName(answers.projectName);

      await finalize();
    })
    .catch(async error => {
      console.log('Error in startup', error);
      await executeCommand('git reset --hard');
    })
    .finally(async () => {
      if (success) {
        console.log('Startup finished, please update the project readme');

        if (finalizeCommands.length > 0) {
          console.log('Run the following commands to remove unused modules:');
          console.log(finalizeCommands.join('\n'));

          for (const command of finalizeCommands) {
            await executeCommand(command);
          }
        }

        process.exit();
      } else {
        console.log('Startup failed');
      }
    });
}

/**
 * Finalizes the project setup process, executing final commands.
 */
async function finalize() {
  finalizeCommands.push('npm run lint');
  finalizeCommands.push('git init && cd .git && del index && git reset');

  success = true;
}

/**
 * Removes unselected modules from the project's module list.
 * This function compares the list of available modules with the list of selected modules
 * and returns a new list containing only the modules that were not selected.
 *
 * @param {string[]} modules - The list of selected modules.
 * @returns {string[]} A list of modules that are not in the list of selected modules.
 */
function removeUnselectedModules(modules) {
  const modulesToRemove = projectModules.filter(
    module => !modules.includes(module),
  );

  console.log(`Modules to be removed:\n${modulesToRemove.join('\n')}`);
  return modulesToRemove;
}

/**
 * Removes unselected modules from the project.
 * @param {string[]} modules - Modules selected to keep.
 */
async function removeModules(modules) {
  const path = await import('path');
  const fs = await import('fs');

  if (!modules) {
    return;
  }

  let deleteCommand;
  if (process.platform === 'win32') {
    deleteCommand = 'del';
  } else if (process.platform === 'linux' || process.platform === 'darwin') {
    deleteCommand = 'rm -rf';
  }

  const modulesToRemove = removeUnselectedModules(modules);

  /**
   * Deletes a file or directory.
   * @param {string} filePath - The path of the file or directory to be deleted.
   */
  async function execDeleteCommand(filePath) {
    const fullPath = path.join(__dirname, filePath);

    // Verifica se é um arquivo .ts ou .js
    if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
      // É um arquivo, então exclua usando o comando apropriado
      if (fs.existsSync(fullPath)) {
        const deleteCommand =
          process.platform === 'win32'
            ? `del "${fullPath}"`
            : `rm -f "${fullPath}"`;
        await executeCommand(deleteCommand);
      } else {
        console.log(`File not found: ${fullPath}`);
      }
    } else {
      // É uma pasta, então exclua usando o comando apropriado
      if (fs.existsSync(fullPath)) {
        const deleteCommand =
          process.platform === 'win32'
            ? `rmdir /s /q "${fullPath}"`
            : `rm -rf "${fullPath}"`;
        await executeCommand(deleteCommand);
      } else {
        console.log(`Directory not found: ${fullPath}`);
      }
    }
  }

  if (modulesToRemove.includes('Terraform')) {
    console.log('Removing Terraform');
    await execDeleteCommand('terraform');
  }

  if (modulesToRemove.includes('Axios')) {
    console.log('Removing Axios');
    finalizeCommands.push('npm uninstall axios');
    await execDeleteCommand(path.join('src', 'utils', 'axios'));
  }

  if (modulesToRemove.includes('Cache')) {
    console.log('Removing Cache');

    await execDeleteCommand(path.join('src', 'modules', 'cache'));
    await execDeleteCommand(
      path.join('src', 'modules', 'mongo', 'cache.model.ts'),
    );

    await removeCodeFromFile(
      path.join(__dirname, 'src', 'app.module.ts'),
      /CacheModule,/g,
    );

    await removeCodeFromFile(
      path.join(__dirname, 'src', 'app.module.ts'),
      /import { CacheModule } from '.\/modules\/cache\/cache.module';/g,
    );
  }

  if (modulesToRemove.includes('PDF Creator (Puppeteer)')) {
    console.log('Removing PDF Creator');
    finalizeCommands.push('npm uninstall puppeteer');
    await execDeleteCommand(path.join('src', 'utils', 'create-pdf.ts'));
  }

  if (modulesToRemove.includes('Excel Generator')) {
    console.log('Removing Excel Generator');
    finalizeCommands.push('npm uninstall exceljs');
    await execDeleteCommand(path.join('src', 'utils', 'excel.ts'));
  }

  if (modulesToRemove.includes('QR Code Generator')) {
    console.log('Removing QR Code Generator');
    finalizeCommands.push('npm uninstall qrcode');
    await execDeleteCommand(path.join('src', 'utils', 'qr-code-generator.ts'));
  }
}
/**
 * Remove chaves específicas do arquivo package.json.
 * @param {string|string[]} keys - Chaves a serem removidas.
 */
async function removeFromPackageJson(keys) {
  const path = await import('path');
  const fs = await import('fs');

  const packageJSONPath = path.join(__dirname, 'package.json');
  fs.readFile(packageJSONPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error removing husky from package json', err);
      throw err;
    }

    if (typeof keys === 'string') {
      keys = [keys];
    }

    const packageJSON = JSON.parse(data);

    for (const key of keys) {
      if (packageJSON.scripts && packageJSON.scripts[key]) {
        delete packageJSON.scripts[key];
      }
    }

    fs.writeFile(
      packageJSONPath,
      JSON.stringify(packageJSON, null, 2),
      'utf8',
      err => {
        if (err) {
          console.error('Error rewriting package json', err);
          throw err;
        } else {
          console.log('Dados removidos do package.json');
        }
      },
    );
  });
}

/**
 * Substitui texto em um arquivo usando uma expressão regular.
 * @param {string} filePath - Caminho do arquivo a ser modificado.
 * @param {RegExp} regex - Expressão regular para encontrar o texto a ser substituído.
 * @param {string} replace - Texto de substituição.
 */
async function replaceInFile(filePath, regex, replace) {
  const fs = await import('fs');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      throw err;
    }

    const updatedData = data.replace(regex, replace);

    fs.writeFile(filePath, updatedData, 'utf8', err => {
      if (err) {
        console.error('Erro ao escrever no arquivo:', err);
      } else {
        console.log('Arquivo atualizado com sucesso.');
      }
    });
  });
}

/**
 * Remove um código específico de um arquivo.
 * @param {string} filePath - Caminho do arquivo a ser modificado.
 * @param {string} codeToRemove - Código a ser removido.
 */
async function removeCodeFromFile(filePath, codeToRemove) {
  const fs = await import('fs/promises');

  try {
    // Ler o conteúdo do arquivo
    const data = await fs.readFile(filePath, 'utf8');

    // Remover o código especificado
    const updatedData = data.replace(codeToRemove, '');

    // Reescrever o arquivo com o conteúdo atualizado
    await fs.writeFile(filePath, updatedData, 'utf8');
    console.log('Código removido do arquivo');
  } catch (err) {
    console.error('Erro ao manipular o arquivo', err);
    throw err;
  }
}

/**
 * Adiciona uma pergunta sobre o nome do projeto ao conjunto de perguntas.
 * @param {Object[]} questions - Conjunto de perguntas.
 */
function questionSetProjectName(questions) {
  questions.push({
    type: 'input',
    name: 'projectName',
    message: 'Insira o nome do projeto:',
  });
}

/**
 * Adds a question about the selection of modules to the set of questions.
 * @param {Object[]} questions - Set of questions.
 */
function questionsSetModules(questions) {
  questions.push({
    type: 'checkbox',
    name: 'modules',
    message: 'Select the modules you want to use:',
    choices: [
      { name: 'Terraform', checked: true },
      { name: 'Cache', checked: true },
      { name: 'Axios', checked: true },
      { name: 'PDF Creator (Puppeteer)', checked: true },
      { name: 'Excel Generator', checked: true },
      { name: 'QR Code Generator', checked: true },
      { name: 'Docker Compose (Dev)', checked: true },
    ],
  });
}

start();
