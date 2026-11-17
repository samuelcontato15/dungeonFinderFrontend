# Dungeon Finder (Frontend)

Projeto Integrador – 4º semestre de ADS. App em React Native + Expo (Expo Router) que roda no **celular (Expo Go)** e no **navegador**.

Este repositório é só o **frontend** ([backend aqui](https://github.com/samuelcontato15/dungeonFinderBackend)): para login, cadastro, raids, guildas etc. funcionarem, a **API (backend)** do Dungeon Finder precisa estar rodando e acessível.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (já inclui o npm)
- [Git](https://git-scm.com/)
- A API do Dungeon Finder rodando ([dungeonFinderBackend](https://github.com/samuelcontato15/dungeonFinderBackend.git)) e a URL dela
- Para testar no celular: app **Expo Go** (Android/iOS), com o celular na **mesma rede Wi-Fi** do computador

## Instalação

```bash
# 1. Clonar
git clone https://github.com/samuelcontato15/dungeonFinderFrontend.git
cd dungeonFinderFrontend

# 2. Instalar as dependências
npm install
```

## Configurar a URL da API

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_OU_URL:PORTA
```

Exemplos:

| Onde você vai testar | Valor |
|---|---|
| Navegador (web) | `http://localhost:8080` |
| Celular com Expo Go | `http://192.168.0.10:8080` (IP do PC na rede, **não** use `localhost`) |
| Emulador Android | `http://10.0.2.2:8080` |

> Troque a porta pela que o seu backend usa. Descubra o IP do PC com `ipconfig` (Windows) ou `ifconfig` / `ip a` (Linux/macOS).
> Depois de alterar o `.env`, reinicie o servidor com `npx expo start -c`.

## Rodando

```bash
npm start
```

Com o servidor aberto:

- **Navegador:** pressione `w` no terminal (ou rode `npm run web`)
- **Celular:** abra o Expo Go e escaneie o QR code mostrado no terminal
- **Android (emulador):** pressione `a` (ou `npm run android`)
- **iOS (simulador, só macOS):** pressione `i` (ou `npm run ios`)

## Passo a passo para testar

1. Suba o backend e confirme que a URL do `.env` responde.
2. Rode `npm start` e abra o app (web ou Expo Go).
3. Na tela inicial, crie uma conta em **Cadastro** e faça **Login**.
4. Explore: jogos, raids (criar/editar), guildas e chat, amigos, comunidade, perfil, notificações e configurações.
5. Para o painel **Admin** (usuários, jogos, guildas, raids, eventos, relatórios), entre com uma conta de administrador do backend.

## Problemas comuns

| Problema | Solução |
|---|---|
| Erro de rede / "Network Error" no celular | `EXPO_PUBLIC_API_URL` está com `localhost`; use o IP do PC e mantenha ambos na mesma rede |
| Mudei o `.env` e nada mudou | Reinicie com `npx expo start -c` |
| QR code não conecta | Tente `npx expo start --tunnel` |
| Erro de CORS no navegador | Libere a origem do Expo web (normalmente `http://localhost:8081`) no backend |
| Erros estranhos após `npm install` | Apague `node_modules` e rode `npm install` de novo |

## Tecnologias

Expo 58, React Native 0.88, Expo Router, React Native Paper, Axios, TypeScript.
