### Menu de Navegação

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Descrição](#descrição)
3. [Contribuição](#contribuição)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Extensões do VSCode Recomendadas](#extensões-do-vscode-recomendadas)
6. [Iniciando o Projeto](#iniciando-o-projeto)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Documentação das Dependências](#documentação-das-dependências)
9. [Arquitetura do Projeto](#arquitetura-do-projeto)
    - [Átomos](#átomos)
    - [Moléculas](#moléculas)
    - [Relacionamento entre Átomos e Moléculas](#relacionamento-entre-átomos-e-moléculas)
    - [Context](#context)
    - [Routes](#routes)
    - [Locales (i18n)](#locales-i18n)
    - [Modules](#modules)
    - [Helpers](#helpers)
    - [Services](#services)
    - [Types](#types)
    - [Pipeline](#pipeline)
    - [Verzel UI Lib](#verzel-ui-lib)
    
<hr>

### Sobre o Projeto

Os projetos de white label são uma solução integrada que abrange os aspectos de backend, frontend e infraestrutura, concebidos para simplificar o desenvolvimento das funcionalidades essenciais. Este projeto específico é um template elaborado com Vite, proporcionando uma configuração inicial para o desenvolvimento de aplicações React.

### Descrição

O projeto inclui inicialmente os seguintes módulos:

* **Perfil**
  * Edição de perfil
  * Atualização de senha

* **Login / Autenticação**
  * Login
  * Recuperação de senha

* **Usuários**
  * Listagem
    * Inclui opções para exclusão de usuário, bloqueio de acesso e reenvio de email de confirmação.
  * Filtragem
    * Filtragem por função (Role)
    * Filtragem por campos da listagem

  * Criação / Atualização
    * Permite o cadastro inicial de Nome, Email e Função (Role)

    * As permissões determinam as ações que um usuário pode realizar em um módulo específico.

<hr>

### Contribuição

Crie uma pull request descrevendo tudo que foi modificado juntamente com o mótivo da modificação e o que isso melhora no projeto.

<hr>

### Tecnologias utilizadas

- **Node.js**: Versão 20.11.0
- **ViteJs**: Versão 5.0.0
- **React**: Versão 18.2.0

<hr>

### Extensões do VSCode recomendadas

- Eslint
- Prettier

<hr>

### Iniciando o projeto

- Rode 
  ``` bash
  npm install
  ```

- Rode 
  ``` bash
  npm run dev
  ```

- Modifique o nome do projeto no package.json
- Crie o .env
- Copie o .env.example para dentro do .env
- Insira os valores no .env

<hr>

### Variáveis de ambiente

VITE_PRIMARY: Cor primária do projeto

VITE_PRIMARYDARK: Cor preta primária

VITE_SECONDARY: Cor secundária

VITE_SECONDARYDARK: Cor preta secundária

VITE_TERNARY: Cor ternária

VITE_TERNARYDARK: Cor preta ternária

VITE_WHITE: Cor branca

VITE_API_URL: Base url da API ex: http://localhost:3333/api

VITE_BRAND_LOGO: URL da logo

VITE_SIDEBAR_LOGO: URL da logo da side bar

VITE_ENVIRONMENT: DEV | HML | PROD

<hr>

### Documentação das Dependências

- **@verzel/ui**: Pacote que oferece componentes de interface do usuário da biblioteca Verzel para o projeto.
  - [Documentação do @verzel/ui](https://ui-lib.verzel.com.br/)

- **@tabler/icons-react**: Pacote que oferece ícones reativos da biblioteca Tabler Icons para uso no projeto.
  - [Documentação do @tabler/icons-react](https://tablericons.com/)

- **axios**: Biblioteca para fazer requisições HTTP a endpoints, geralmente utilizada para comunicação com APIs.
  - [Documentação do Axios](https://axios-http.com/docs/intro)

- **framer-motion**: Biblioteca para animações e transições no React, oferecendo uma API simples e poderosa para criar interfaces dinâmicas.
  - [Documentação do Framer Motion](https://www.framer.com/api/motion/)

- **i18next**: Biblioteca para internacionalização (i18n) em JavaScript, permitindo a tradução e localização de textos no aplicativo.
  - [Documentação do i18next](https://www.i18next.com/)

- **i18next-browser-languagedetector**: Detector de idioma para o i18next que determina automaticamente o idioma preferido do usuário com base nas configurações do navegador.
  - [Documentação do i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)

- **jose**: Biblioteca que oferece implementações em JavaScript para JSON Object Signing and Encryption (JOSE), utilizadas para autenticação e segurança em sistemas web.
  - [Documentação do jose](https://github.com/panva/jose)

- **lodash**: Biblioteca utilitária que fornece funções úteis para manipulação de arrays, objetos, strings, etc., em JavaScript.
  - [Documentação do Lodash](https://lodash.com/docs/4.17.15)

- **react**: Biblioteca JavaScript para construção de interfaces de usuário, desenvolvida pelo Facebook.
  - [Documentação do React](https://reactjs.org/docs/getting-started.html)

- **react-dom**: Pacote que permite renderizar componentes React no navegador.
  - [Documentação do ReactDOM](https://reactjs.org/docs/react-dom.html)

- **react-i18next**: Pacote que fornece integração entre o React e o i18next para facilitar a internacionalização em aplicativos React.
  - [Documentação do react-i18next](https://react.i18next.com/)

- **react-router-dom**: Pacote que fornece roteamento declarativo para aplicativos React, permitindo a navegação entre diferentes componentes da interface de usuário com base no URL.
  - [Documentação do react-router-dom](https://reactrouter.com/docs/en/v6/getting-started/tutorial)

- **react-tooltip**: Pacote que oferece componentes de dica de ferramenta (tooltip) para o React, exibidos quando o usuário passa o mouse sobre um elemento.
  - [Documentação do react-tooltip](https://www.npmjs.com/package/react-tooltip)

- **styled-components**: Biblioteca para estilização de componentes no React utilizando CSS-in-JS, permitindo a criação de estilos de forma declarativa e dinâmica.
  - [Documentação do styled-components](https://styled-components.com/docs)

- **yup**: Biblioteca de validação de esquemas para JavaScript, comumente utilizada para validar dados de formulários em aplicativos web.
  - [Documentação do Yup](https://github.com/jquense/yup)

<hr>

### Arquitetura do projeto

#### Átomos

- **Definição**: Os átomos são os componentes de nível mais básico e elementar de uma interface. Eles representam os elementos visuais e funcionais mais simples, como botões, campos de texto, ícones, etc.
- **Características**:
  - **Pequenos e simples**: Os átomos são componentes simples e pequenos, com funcionalidades bem definidas e específicas.
  - **Reutilizáveis**: Eles devem ser projetados para serem reutilizáveis em diferentes partes do sistema.
  - **Estilizáveis**: Os átomos geralmente têm estilos visuais consistentes que podem ser facilmente modificados e estilizados.
- **Exemplos**: Botões, campos de entrada, ícones, cores, tipografia, etc.

#### Moléculas

- **Definição**: As moléculas são combinações de átomos que formam unidades mais complexas e funcionais. Elas representam componentes compostos por vários átomos trabalhando juntos para cumprir uma função específica.
- **Características**:
  - **Compostas**: As moléculas são compostas por átomos que interagem entre si para realizar uma tarefa mais complexa.
  - **Coerentes**: Elas mantêm uma lógica interna coerente, com os átomos que as compõem contribuindo de forma coordenada para sua funcionalidade geral.
  - **Reutilizáveis**: Assim como os átomos, as moléculas devem ser projetadas para serem reutilizáveis em diferentes partes do sistema.
- **Exemplos**: Barra de navegação, formulários, cartões de informações, cabeçalhos de página, etc.

#### Relacionamento entre Átomos e Moléculas

- **Composição Hierárquica**: As moléculas podem conter átomos e outras moléculas, formando uma estrutura hierárquica que permite a construção de interfaces complexas a partir de componentes simples.
- **Abstração e Reutilização**: A arquitetura de átomos e moléculas promove a abstração e a reutilização de componentes, permitindo que partes da interface sejam facilmente modificadas e reaproveitadas em diferentes contextos.

<hr>

#### Context

O contexto do whitelabel contém a parte de autenticação de usuário, axios, manipulação de local storage e centralização dos estados de auth

<hr>

#### Routes

Contém toda a parte de rotas da aplicação seguindo a padronização do React DOM Routes

<hr>


#### Locales ( i18n )

O i18n conta com o inglês e português, ele é responsável por fazer toda a tradução do sistema para as 2 linguagens

<hr>

#### Modules

```
module
│
├── components
│   └── index.tsx
├── hooks
│   └── index.ts
├── screens
│   └── index.tsx
│   └── style.tsx
└── index.ts
```

<hr>

#### Helpers

Contém funções de utilidade que ajudam a modularizar a reutilizar trechos de código no projeto

#### Services

Nos serviços temos arquivos que consomem uma instância do axios para fazer requisições HTTP

#### Types

Contém todos os tipos que são utilizados nos módulos e submódulos seguindo a mesma arquitetura de pastas do "Modules"

### Pipeline

A pipeline do bitbucket sobe o build para o bucket s3 e invalida o cloudfront para redistribuir a nova versão

<hr>

### Verzel UI Lib

A biblioteca da verzel traz componentes pré prontos para serem utilizados dentro do projeto, a ideia é criar uma comunidade onde todos possam se auxiliar nas novas versões da biblioteca.