Projeto 2 - CHITCHAT (Twitter clone)

## Frameworks
```
Vue
Bootstrap
```

### Libraries
```
Axios
Jquery
Lightbox2
Pinia
Vue-router
```

### Services/Platforms
```
Firebase Database
Firebase Authentication
Firebase Storage
```

### Resumo da App
- App criada utilizando Vue-CLI
- Componentes Navbar e Sidebar com varios botões e redirecionamento utilizando Vue Router.
- Páginas de registo e login funcionais.
- Homepage com apresentação de notícias provenientes de uma API (através do axios) e com apresentação de sugestão de utilizadores a seguir, baseado nos utilizadores registados na base de dados e que o utilizador autenticado não está a seguir. Ao seguir um utilizador os tweets do mesmo devem aparecer na Dashboard e a sugestão do mesmo desaparece da Homepage. Ao dar unfollow na Dashboard a sugestão voltará a aparecer.
- Página Dashboard com input para postagem de tweets (incluindo imagens, guardadas no Storage da Firebase e acessadas/renderizadas através das bibliotecas jquery e lightbox2). Inclui também um feed apresentando todos os tweets do próprio utilizador e dos utilizadores que ele segue por ordem ascendente de data/hora. Tweets apresentam botões Like (com número total de likes), Unfollow, Reply e Delete(apenas os próprios tweets) funcionais, foto e nome do utilizador, e também data e hora de postagem. Os replys apresentam a mesma informação excepto a possibilidade de reply.
- Página de Perfil com apresentação dos dados do utilizador e possibilidade de alteração dos mesmos (incluindo imagem de perfil).
- Página de Admin com searchbar na qual o admin pode pesquisar utilizadores por email e alterar os seus dados de perfil ou eliminar utilizadores. A pesquisa apresenta também todos os tweets do utilizador pesquisado e permite a sua eliminação.
- Componente Footer (não funcional).
- Vários componentes contêm apresentação dinâmica de elementos com base no estado de autenticação.


### ATENÇÃO

Para executar a aplicação deverá instalar as dependências utilizando "npm install". Para correr a aplicação utilizar "npm run serve" no terminal do VS Code.
Para efetuar os testes é necessário um utilizador autenticado. Para tal utilize a página de registo e introduza um email e password (não necessitam de ser os dados pessoais, podem ser usados dados "falsos") e efetue login com os mesmos.

De modo a serem testadas as funcionalidades do Admin deve ser feito login com os seguintes dados:
Email: admin@x.com
Password: 000000

