# React E-commerce App

Aplicação de e-commerce moderna com React, Vite, Express e integração com Gemini AI.

## 🚀 Tecnologias

- **Frontend**: React 19, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js
- **AI**: Google Gemini API
- **Autenticação**: Firebase
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Configuração Local

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas credenciais:
   ```
   GEMINI_API_KEY=sua_chave_gemini
   APP_URL=http://localhost:3000
   ```

3. **Execute em desenvolvimento:**
   ```bash
   npm run dev
   ```
   
   A aplicação estará disponível em `http://localhost:3000`

## 🌐 Deploy

### GitHub

1. **Inicialize o repositório Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Crie um repositório no GitHub** e conecte:
   ```bash
   git remote add origin https://github.com/seu-usuario/seu-repo.git
   git branch -M main
   git push -u origin main
   ```

### Vercel

1. **Instale a Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Faça deploy:**
   ```bash
   vercel
   ```

3. **Configure as variáveis de ambiente** no dashboard da Vercel:
   - `GEMINI_API_KEY`: Sua chave da API Gemini
   - `APP_URL`: URL do seu projeto na Vercel

### Supabase (Opcional)

Se desejar usar Supabase para banco de dados:

1. **Crie um projeto** em [supabase.com](https://supabase.com)
2. **Configure as variáveis de ambiente:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
   ```
3. **Instale o cliente Supabase:**
   ```bash
   npm install @supabase/supabase-js
   ```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verifica tipos TypeScript

## 🏗️ Estrutura do Projeto

```
├── src/
│   ├── components/    # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── lib/           # Utilitários (firebase, gemini)
│   └── context/       # Contextos React
├── server.ts          # Servidor Express
├── vite.config.ts     # Configuração Vite
└── vercel.json        # Configuração Vercel
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Chave da API Google Gemini | Sim |
| `APP_URL` | URL da aplicação | Sim |

## 📝 Licença

Este projeto é privado e confidencial.
