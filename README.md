# 🍺 Gralha Brewing Co. — Plataforma Institucional & E-Commerce Artesanal

<p align="center">
  <img src="./public/logos/selo-completo-transparente.png" alt="Gralha Brewing Co. — Curitiba, PR" width="180" />
</p>

<p align="center">
  <strong>Da cultura cervejeira de Curitiba para o seu copo.</strong><br />
  Plataforma web editorial, catálogo interativo e e-commerce blindado (SQLite WAL + Criptografia AES-256-GCM) desenvolvidos para a cervejaria independente <strong>Gralha Brewing Co.</strong> (Est. 2024 • Curitiba, Paraná).
</p>

---

## ✨ Visão Geral do Projeto

A **Gralha Brewing Co.** nasceu em 2024 a partir de brassagens caseiras em família no clima frio de Curitiba, inspirada pela **Gralha-Azul** — ave símbolo do Paraná e guardiã das matas de araucária.

Esta aplicação web foi projetada com uma arquitetura **Editorial & Direct-to-Consumer (D2C)** dividida em duas experiências complementares:

1. **Página 1 — A Marca & História (`brand`)**:
   - **Age Gate (+18)** com persistência local e mensagem de consumo responsável.
   - **Hero Section Editorial** com fotografia curada e manifesto da cervejaria.
   - **Storytelling & Escolas Cervejeiras**: Apresentação das linhas de *Pilsens & Lagers*, *IPAs & Lupuladas* e *Receitas Sazonais*, além das etapas do processo produtivo e cadeia fria.
2. **Página 2 — Catálogo Oficial & Loja Online (`catalog`)**:
   - **Grid Fotográfico de Rótulos** (incluindo o rótulo autoral *Voo Rasante Pilsen*, *Gralha Azul West Coast IPA*, *Copa das Araucárias NEIPA*, entre outros).
   - **Ficha Sensorial Expansível** por cerveja (ABV, IBU, EBC, lúpulos, maltes, copo ideal, temperatura de serviço e harmonização).
   - **Caixas Fechadas (Packs)** com desconto progressivo.
   - **Sacola Lateral (Quick Cart Drawer)** com cálculo dinâmico de meta para **Frete Express Grátis em Curitiba** (pedidos acima de R$ 120,00).
   - **Checkout Transparente Conectado ao Back-End**: Consulta automática de CEP via **ViaCEP**, opções de entrega locais (*Delivery Gelado CWB em até 2h*, *Retirada Local* ou *Transportadora PR*), pagamento via **PIX (5% OFF validado no servidor)** ou **Cartão de Crédito** e geração de protocolo criptográfico de pedido.

---

## 🛡️ Arquitetura de Segurança (AppSec, OWASP & LGPD)

O projeto conta com um **Back-End Node.js nativo + SQLite 3 (`node:sqlite`)** construído sob princípios *Security-by-Design* e auditado contra vulnerabilidades OWASP Top 10:

- **Criptografia Autenticada em Repouso (LGPD):** Dados pessoais sensíveis (nome completo, telefone/WhatsApp e endereço de entrega) são criptografados antes de tocar o disco utilizando **AES-256-GCM** com IV aleatório de 96 bits (NIST SP 800-38D) e validação explícita de `AuthTag` de 128 bits (`backend/security/crypto.js`).
- **Blind Indexing (HMAC-SHA256):** Telefones e endereços IP são indexados/anonimizados via hash determinístico com chave secreta (`HMAC-SHA256`), permitindo auditoria e rate limiting sem armazenar dados em texto puro.
- **Conformidade PCI-DSS no Checkout:** O Front-End trunca o número do cartão no cliente e transmite apenas os 4 últimos dígitos (`last4`). O servidor rejeita explicitamente qualquer tentativa de envio de PAN completo ou CVV.
- **Prevenção Total contra SQL Injection:** 100% das consultas utilizam *Prepared Statements* parametrizados (`db.prepare()`).
- **Cálculo Autoritativo Server-Side (Anti-Tampering):** O endpoint `POST /api/orders` ignora qualquer preço enviado pelo navegador, recalculando subtotais, estoque, regras de frete e descontos PIX diretamente a partir do banco SQLite dentro de transações atômicas (`BEGIN IMMEDIATE TRANSACTION`).
- **SQLite Hardened:** Configurado com `PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON` e `PRAGMA secure_delete = ON` (sobrescreve registros deletados com zeros no disco físico).
- **Defesa HTTP & Anti-DoS:**
  - Rate Limiting em janela deslizante por IP verificado (com proteção contra *`X-Forwarded-For` Spoofing* e limite máximo de buckets em memória).
  - Limite estrito de payload JSON (16 KB) com leitura segura de buffers UTF-8 multi-byte.
  - Inspeção recursiva contra *Prototype Pollution* (`__proto__`, `constructor`, `prototype`).
  - Cabeçalhos HTTP estritos (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`).
- **Protocolos de Alta Entropia (Anti-IDOR):** Geração de protocolos `GRB-XXXXXXXXXX` com 50 bits de entropia criptográfica (Base32 sem caracteres ambíguos) e rate limit dedicado na rota de consulta.

---

## 🗂️ Estrutura do Repositório

```text
gralha-brewing/
├── api/
│   └── index.js                 # Adaptador Serverless API para deploy na Vercel
├── backend/
│   ├── db/
│   │   └── database.js          # Inicialização SQLite WAL, tabelas, triggers LGPD e seed/upsert
│   ├── security/
│   │   ├── crypto.js            # AES-256-GCM, HMAC-SHA256, Timing-Safe Auth e gerador de protocolo
│   │   ├── middleware.js        # Rate Limiter, Headers OWASP e Parser JSON Anti-DoS/Anti-Pollution
│   │   └── validator.js         # Sanitização XSS, deduplicação de itens e validação estrita de pedidos
│   ├── config.js                # Gerenciamento e geração automática de chaves locais (.env.local)
│   └── server.js                # Servidor HTTP RESTful nativo (Porta 3001)
├── public/
│   └── logos/                   # Identidade visual oficial, selos transparentes e foto Voo Rasante
├── src/
│   ├── components/
│   │   ├── AgeGateModal.jsx     # Verificação +18 com persistência
│   │   ├── CatalogPage.jsx      # Catálogo interativo, packs, ViaCEP e modal de Checkout
│   │   ├── Footer.jsx           # Rodapé editorial e controle do Age Gate
│   │   ├── HeroSection.jsx      # Dobra principal da marca
│   │   ├── Navbar.jsx           # Navegação responsiva e contador da sacola
│   │   ├── PhaseOneShowcase.jsx # História (2024), escolas cervejeiras e processo produtivo
│   │   └── QuickCartDrawer.jsx  # Sacola lateral com barra de progresso para frete grátis
│   ├── data/
│   │   └── beers.js             # Catálogo oficial de cervejas, fichas técnicas e caixas fechadas
│   ├── App.jsx                  # Gerenciamento de estado global (Página ativa, Sacola, Age Gate)
│   ├── index.css                # Estilos globais e configuração Tailwind CSS
│   └── main.jsx                 # Ponto de entrada React 18
├── Logos/                       # Arquivos-fonte de marca e fotografia do rótulo Voo Rasante
├── planilha_horas_gralha_brewing.csv # Planilha detalhada de escopo, horas e custos do projeto
├── vercel.json                  # Rewrites Serverless e Security Headers para a Vercel
└── vite.config.js               # Configuração do Vite + Proxy reverso /api -> localhost:3001
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** `v22.5.0` ou superior (necessário para o módulo nativo `node:sqlite`).
- **npm** `v10+`.

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o Back-End Seguro (SQLite + AES-256-GCM)
Em um terminal, inicie o servidor da API na porta `3001`:
```bash
npm run server
```
> 💡 **Nota:** Na primeira execução, o arquivo `backend/.env.local` (ignorado pelo Git) será gerado automaticamente com chaves criptográficas aleatórias de 256 bits (`DATA_ENCRYPTION_KEY_HEX`, `HMAC_BLIND_INDEX_SECRET` e `ADMIN_API_TOKEN`), e o banco `backend/data/gralha_brewing.sqlite` será populado com o catálogo oficial.

### 3. Iniciar o Front-End (Vite + React)
Em outro terminal, inicie o servidor de desenvolvimento na porta `5173`:
```bash
npm run dev
```
Acesse no navegador: **`http://localhost:5173`**

---

## 🔌 Endpoints da API

| Método | Rota | Descrição | Autenticação / Limite |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/health` | Status do serviço, controles de segurança ativos e contagem de pedidos criptografados. | Pública (90 req/min) |
| `GET` | `/api/products` | Lista completa de cervejas avulsas e caixas fechadas com preço e estoque real do SQLite. | Pública (90 req/min) |
| `POST` | `/api/orders` | Criação transacional de pedido com cálculo server-side, reserva de estoque e criptografia AES-256-GCM. | Pública (12 req/15min) |
| `GET` | `/api/orders/:protocol` | Consulta de pedido por protocolo (`GRB-XXXXXXXXXX`) com dados mascarados. | Pública (15 req/15min) |
| `GET` | `/api/admin/audit` | Trilha de auditoria (`security_audit_logs`) com eventos críticos de segurança. | `Bearer <ADMIN_API_TOKEN>` (Timing-Safe) |

---

## ☁️ Deploy na Vercel

O repositório já está configurado para deploy imediato na **Vercel** (Front-End estático via Vite + Serverless Functions em `api/index.js` roteadas via `vercel.json`):

1. Importe o repositório `Cvinicius-7/gralha-brewing` em [vercel.com/new](https://vercel.com/new).
2. Mantenha o preset padrão **Vite** (`npm run build` / diretório `dist`).
3. Clique em **Deploy**.

---

<p align="center">
  <sub>© 2024–2026 <strong>Gralha Brewing Co.</strong> • Curitiba, Paraná, Brasil.<br />Beba com moderação. Venda e consumo proibidos para menores de 18 anos.</sub>
</p>
