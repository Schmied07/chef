# Migration Guide: Sprint 1 → Sprint 2

Guide de migration du Sprint 1 (Engine MVP) vers le Sprint 2 (Workers & Sandbox).

## 📋 Vue d'ensemble

### Sprint 1 (Before)
- ✅ @chef/engine avec pipeline AI
- ✅ Emergent Universal API intégré
- ✅ Génération de code fonctionnelle
- ❌ Pas de build réel
- ❌ Pas de workers
- ❌ Pas d'isolation sandbox

### Sprint 2 (After)
- ✅ Tout du Sprint 1, PLUS:
- ✅ Docker sandbox pour builds isolés
- ✅ BullMQ queue avec Redis
- ✅ Workers avec retry & backoff
- ✅ Build pipeline complet (5 phases)
- ✅ Artifact management
- ✅ Production-ready avec Docker Compose

## 🔄 Changements Breaking

### 1. Structure des fichiers

**Avant (Sprint 1):**
```
/app/packages/engine/
  - src/
  - ai-service/
```

**Après (Sprint 2):**
```
/app/
  - packages/engine/
  - services/backend/       # ← NOUVEAU
    - src/
      - workers/           # ← NOUVEAU
      - services/          # ← NOUVEAU
```

### 2. Variables d'environnement

**Nouvelles variables requises:**
```env
# Redis (requis pour la queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Worker configuration
WORKER_CONCURRENCY=5
WORKER_TIMEOUT=300000

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_MEMORY_LIMIT=512m
DOCKER_CPU_LIMIT=1

# Build directories
BUILD_DIR=/tmp/chef-builds
ARTIFACTS_DIR=/tmp/chef-artifacts

# Convex webhooks
CONVEX_URL=https://api.convex.dev
CONVEX_WEBHOOK_SECRET=your_secret
```

### 3. Nouveaux endpoints API

**Ajoutés:**
- `POST /v1/generate` - Génération AI + build automatique
- `GET /v1/projects/:id/artifacts` - Liste des artifacts
- `GET /v1/projects/:id/artifacts/:name` - Téléchargement
- `GET /metrics` - Métriques système

## 🚀 Migration Étape par Étape

### Étape 1: Mise à jour du code

```bash
# 1. Pull les dernières modifications
cd /app
git pull origin refactor/monorepo

# 2. Installer les nouvelles dépendances
pnpm install
```

### Étape 2: Configuration de l'environnement

```bash
cd /app/services/backend

# 1. Copier le nouveau .env
cp .env.example .env

# 2. Ajouter vos clés existantes du Sprint 1
# EMERGENT_LLM_KEY (garder la même)
# AI_PROVIDER (garder le même)
# AI_MODEL (garder le même)

# 3. Ajouter les nouvelles variables
nano .env  # ou votre éditeur préféré
```

**Variables minimales requises:**
```env
EMERGENT_LLM_KEY=sk-emergent-9F51f0520965598045  # Votre clé existante
REDIS_HOST=localhost
WORKER_CONCURRENCY=5
CONVEX_WEBHOOK_SECRET=your_secret_here
```

### Étape 3: Installation des dépendances système

```bash
# Vérifier Docker
docker --version

# Vérifier Docker Compose
docker-compose --version

# Si manquants, installer:
# Mac: brew install docker docker-compose
# Linux: apt-get install docker.io docker-compose
```

### Étape 4: Build des packages

```bash
cd /app

# Build @chef/engine (si pas déjà fait)
pnpm --filter @chef/engine build

# Build @chef/compiler
pnpm --filter @chef/compiler build

# Build @chef/backend (nouveau)
pnpm --filter @chef/backend build
```

### Étape 5: Démarrage des services

**Option A: Docker Compose (recommandé)**
```bash
cd /app/services/backend

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

**Option B: Mode développement**
```bash
# Terminal 1: Redis
docker-compose up -d redis

# Terminal 2: Backend
cd /app/services/backend
pnpm dev
```

### Étape 6: Vérification

```bash
# Test de santé
curl http://localhost:3001/health

# Devrait retourner:
# {
#   "status": "ok",
#   "services": {
#     "redis": "up",
#     "docker": "up"
#   }
# }

# Test complet
bash examples/test-api.sh
```

## 🔧 Adaptation du code existant

### Si vous utilisiez directement @chef/engine

**Avant (Sprint 1):**
```typescript
import { runPipeline } from '@chef/engine';

const result = await runPipeline({
  text: 'Build a todo app',
  timestamp: new Date(),
});

// result.code.files contient les fichiers générés
// MAIS pas de build réel
```

**Après (Sprint 2) - Option 1: Utiliser l'API**
```bash
# Appel API qui génère ET build
curl -X POST http://localhost:3001/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a todo app"}'

# Retourne: { projectId, jobId, status: "queued" }
```

**Après (Sprint 2) - Option 2: Utiliser directement**
```typescript
import { processAIJob, createBuildJobFromAI } from '@chef/backend/workers/ai-worker';
import { queueBuildJob } from '@chef/backend/workers/queue';

// Génération AI
const aiResult = await processAIJob('Build a todo app');

// Créer un build job
const buildJob = createBuildJobFromAI(jobId, projectId, aiResult);

// Queue le build
await queueBuildJob(buildJob);

// Le worker va:
// 1. Installer les dépendances
// 2. Builder le projet
// 3. Collecter les artifacts
// 4. Envoyer un webhook
```

### Si vous aviez des scripts personnalisés

**Avant:**
```typescript
// Direct engine call
const result = await runPipeline(prompt);
// Faire quelque chose avec result.code.files
```

**Après:**
```typescript
// Utiliser l'API backend
const response = await fetch('http://localhost:3001/v1/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt }),
});

const { projectId } = await response.json();

// Polling du status
while (true) {
  const status = await fetch(`http://localhost:3001/v1/projects/${projectId}/status`);
  const { status: buildStatus } = await status.json();
  
  if (buildStatus === 'completed') {
    // Télécharger les artifacts
    const artifacts = await fetch(`http://localhost:3001/v1/projects/${projectId}/artifacts`);
    break;
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

## 📊 Nouvelles fonctionnalités à utiliser

### 1. Métriques

```bash
# Récupérer les métriques
curl http://localhost:3001/metrics

# Résultat:
# {
#   "summary": {
#     "total": 10,
#     "completed": 8,
#     "successful": 7,
#     "failed": 1,
#     "successRate": 87.5,
#     "avgDuration": 45000
#   }
# }
```

### 2. Monitoring en temps réel

```bash
# Dashboard de monitoring
bash examples/monitor.sh
```

### 3. Artifacts

```bash
# Lister les artifacts
curl http://localhost:3001/v1/projects/{id}/artifacts

# Télécharger
curl -O http://localhost:3001/v1/projects/{id}/artifacts/dist
```

## 🐛 Problèmes courants

### 1. Redis connection refused

**Erreur:**
```
Error: Redis connection refused
```

**Solution:**
```bash
# Vérifier Redis
docker-compose ps redis

# Démarrer Redis
docker-compose up -d redis
```

### 2. Docker not available

**Erreur:**
```
Docker is not available - builds will fail
```

**Solution:**
```bash
# Mac: Démarrer Docker Desktop
open -a Docker

# Linux: Démarrer le daemon
sudo systemctl start docker

# Vérifier
docker info
```

### 3. Worker timeout

**Erreur:**
```
Build timeout after 300000ms
```

**Solution:**
```env
# Dans .env, augmenter le timeout
WORKER_TIMEOUT=600000  # 10 minutes
```

### 4. EMERGENT_LLM_KEY not found

**Erreur:**
```
AI generation failed: API key not found
```

**Solution:**
```bash
# Vérifier .env
grep EMERGENT_LLM_KEY /app/services/backend/.env

# Ajouter si manquant
echo "EMERGENT_LLM_KEY=sk-emergent-9F51f0520965598045" >> .env

# Redémarrer
docker-compose restart backend
```

## 🧪 Tests

### Tester la migration

```bash
# 1. Tests unitaires
cd /app/services/backend
pnpm test

# 2. Tests d'intégration
pnpm test:integration

# 3. Test API complet
bash examples/test-api.sh

# 4. Test du monitoring
bash examples/monitor.sh
```

## ✅ Checklist de migration

- [ ] Code mis à jour (git pull)
- [ ] Dépendances installées (pnpm install)
- [ ] .env configuré avec nouvelles variables
- [ ] Docker et Docker Compose installés
- [ ] Packages buildés (pnpm build)
- [ ] Redis démarré
- [ ] Backend démarré
- [ ] Health check OK (curl /health)
- [ ] Test API réussi (bash examples/test-api.sh)
- [ ] Monitoring fonctionnel (bash examples/monitor.sh)

## 📚 Ressources

- [SPRINT2-COMPLETE.md](SPRINT2-COMPLETE.md) - Documentation complète
- [QUICKSTART.md](services/backend/QUICKSTART.md) - Guide de démarrage rapide
- [README.md](services/backend/README.md) - Documentation backend
- [CHANGELOG.md](CHANGELOG.md) - Liste des changements

## 🎯 Prochaines étapes

Une fois la migration terminée:

1. **Familiarisez-vous avec les nouveaux endpoints**
   - Testez `/v1/generate` pour la génération AI
   - Explorez les artifacts
   - Consultez les métriques

2. **Optimisez la configuration**
   - Ajustez `WORKER_CONCURRENCY` selon vos besoins
   - Configurez les limites Docker
   - Testez différents timeouts

3. **Intégrez dans votre workflow**
   - Utilisez l'API dans vos applications
   - Configurez les webhooks Convex
   - Mettez en place le monitoring

4. **Préparez le Sprint 3**
   - Le Sprint 3 portera sur le Frontend MVP
   - Drag & drop canvas
   - Real-time build visualization

---

**Besoin d'aide ?** Consultez [QUICKSTART.md](services/backend/QUICKSTART.md) ou les logs: `docker-compose logs -f`
