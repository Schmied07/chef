# Sprint 2 - Fonctionnalités Essentielles

Documentation des fonctionnalités essentielles implémentées pour compléter le Sprint 2.

## 🎯 Fonctionnalités Implémentées

### 1. ⚡ Gestion des Priorités de Jobs

Les jobs peuvent maintenant être créés avec différents niveaux de priorité :

- `critical` - Priorité la plus haute (traité en premier)
- `high` - Priorité haute
- `normal` - Priorité normale (par défaut)
- `low` - Priorité basse

**Usage :**

```bash
curl -X POST http://localhost:3001/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "files": [...],
    "dependencies": {...},
    "strategy": {...},
    "priority": "high"
  }'
```

**Ordre de traitement :**
```
critical → high → normal → low
```

---

### 2. 💀 Dead Letter Queue (DLQ)

Les jobs qui échouent après tous les retries (3 tentatives) sont automatiquement déplacés vers une Dead Letter Queue pour analyse et retry manuel.

#### Consulter la DLQ

```bash
# Lister les jobs dans la DLQ
GET /v1/queue/dead-letter?start=0&end=10

# Réponse
{
  "success": true,
  "jobs": [
    {
      "id": "dlq_job_123",
      "data": {...},
      "failedReason": "Build failed with exit code 1",
      "attemptsMade": 3,
      "timestamp": "2025-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

#### Retry un job depuis la DLQ

```bash
POST /v1/queue/dead-letter/:jobId/retry

# Réponse
{
  "success": true,
  "message": "Job requeued successfully",
  "newJobId": "retry_job_123_1642245000000"
}
```

#### Nettoyer la DLQ

```bash
DELETE /v1/queue/dead-letter

# Réponse
{
  "success": true,
  "message": "Cleared 5 jobs from dead letter queue",
  "count": 5
}
```

---

### 3. 📊 Monitoring de la Queue

Un nouveau endpoint permet de surveiller l'état de la queue en temps réel.

```bash
GET /v1/queue/stats

# Réponse
{
  "success": true,
  "stats": {
    "queue": {
      "waiting": 5,
      "active": 2,
      "completed": 120,
      "failed": 3,
      "delayed": 0,
      "waitingChildren": 0,
      "total": 130
    },
    "deadLetterQueue": {
      "count": 3
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Métriques disponibles :**
- `waiting` - Jobs en attente de traitement
- `active` - Jobs en cours de traitement
- `completed` - Jobs terminés avec succès
- `failed` - Jobs échoués
- `delayed` - Jobs retardés (scheduled)
- `total` - Total de tous les jobs

---

### 4. 🧪 Exécution des Tests Générés

Le système détecte et exécute automatiquement les tests présents dans le projet.

#### Détection Automatique

Le système recherche :
- Répertoires : `test/`, `__tests__/`, `tests/`, `spec/`
- Fichiers : `*.test.js`, `*.spec.js`, `*.test.ts`, `*.spec.ts`, `*_test.py`

#### Commandes de Test

**Node.js :**
```bash
npm test || npm run test || yarn test
```

**Python :**
```bash
pytest || python -m pytest
```

#### Résultats des Tests

Les résultats sont inclus dans la réponse du build :

```json
{
  "jobId": "job_123",
  "status": "success",
  "testResults": {
    "executed": true,
    "passed": true,
    "total": 25,
    "passed_count": 25,
    "failed_count": 0,
    "skipped_count": 0,
    "duration": 3500,
    "output": "Tests: 25 passed, 25 total..."
  },
  "logs": [...],
  "artifacts": [...]
}
```

**Si aucun test n'est trouvé :**
```json
{
  "testResults": undefined
}
```

---

## 📡 Nouveaux Endpoints

### Queue Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/queue/stats` | Obtenir les statistiques de la queue |
| `GET` | `/v1/queue/dead-letter` | Lister les jobs dans la DLQ |
| `POST` | `/v1/queue/dead-letter/:jobId/retry` | Retry un job depuis la DLQ |
| `DELETE` | `/v1/queue/dead-letter` | Vider la DLQ |

---

## 🔄 Workflow Complet

### 1. Créer un job avec priorité

```bash
curl -X POST http://localhost:3001/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"path": "index.js", "content": "console.log(\"Hello\");"},
      {"path": "index.test.js", "content": "test(\"works\", () => {});"}
    ],
    "dependencies": {"jest": "^29.0.0"},
    "strategy": {
      "runtime": "node",
      "version": "18",
      "installCommand": "npm install",
      "buildCommand": "npm run build"
    },
    "priority": "high"
  }'
```

### 2. Surveiller la progression

```bash
# Vérifier les stats de la queue
curl http://localhost:3001/v1/queue/stats

# Vérifier le statut du job
curl http://localhost:3001/v1/projects/:projectId/status
```

### 3. En cas d'échec

```bash
# Consulter la DLQ
curl http://localhost:3001/v1/queue/dead-letter

# Retry le job
curl -X POST http://localhost:3001/v1/queue/dead-letter/:jobId/retry
```

---

## 🧪 Tests

### Tester les fonctionnalités

```bash
# Script de test automatique
bash examples/test-queue-features.sh

# Test manuel des priorités
curl -X POST http://localhost:3001/v1/projects \
  -d '{"priority": "critical", ...}'

# Test monitoring
curl http://localhost:3001/v1/queue/stats

# Test DLQ
curl http://localhost:3001/v1/queue/dead-letter
```

---

## 📈 Métriques et Performance

### Job Priorities Performance

```
critical: ~0-1s queue time
high:     ~1-5s queue time
normal:   ~5-30s queue time
low:      ~30s+ queue time
```

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: 2 seconds delay
Attempt 3: 4 seconds delay
After 3:   → Dead Letter Queue
```

### Test Execution Overhead

```
No tests:      ~0ms
Small tests:   ~500-2000ms
Medium tests:  ~2-10s
Large tests:   ~10-60s
```

---

## 🔧 Configuration

### Environment Variables

```env
# Worker concurrency (affects priority processing)
WORKER_CONCURRENCY=5

# Worker timeout (includes test execution)
WORKER_TIMEOUT=300000

# BullMQ Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Ajuster les Priorités

Les priorités sont configurées dans `src/workers/queue.ts` :

```typescript
const PRIORITY_MAP: Record<JobPriority, number> = {
  critical: 1,   // Plus petit = plus haute priorité
  high: 2,
  normal: 3,
  low: 4,
};
```

---

## 🐛 Troubleshooting

### DLQ remplit trop vite

**Cause :** Jobs échouent systématiquement  
**Solution :** 
1. Vérifier les logs : `GET /v1/projects/:id/logs`
2. Augmenter le timeout : `WORKER_TIMEOUT=600000`
3. Vérifier les dépendances

### Tests ne s'exécutent pas

**Cause :** Tests non détectés  
**Solution :**
1. Placer les tests dans `test/` ou `__tests__/`
2. Nommer les fichiers `*.test.js` ou `*.spec.js`
3. Ajouter un script `test` dans `package.json`

### Priorités non respectées

**Cause :** Worker concurrency trop élevée  
**Solution :** Réduire `WORKER_CONCURRENCY=1` pour observer les priorités

---

## ✅ Checklist des Fonctionnalités

- [x] Gestion des priorités de jobs (critical, high, normal, low)
- [x] Dead Letter Queue automatique
- [x] Endpoint pour consulter la DLQ
- [x] Retry manuel depuis la DLQ
- [x] Endpoint de monitoring `/v1/queue/stats`
- [x] Détection automatique des tests
- [x] Exécution des tests Node.js (Jest, Mocha, etc.)
- [x] Exécution des tests Python (Pytest)
- [x] Parsing des résultats de tests
- [x] Inclusion des résultats dans BuildResult

---

## 🚀 Prochaines Améliorations (Optionnel)

- [ ] WebSocket pour notifications temps réel
- [ ] Dashboard de monitoring visuel
- [ ] Alertes pour DLQ pleine
- [ ] Retry automatique depuis DLQ après X temps
- [ ] Support d'autres frameworks de test (Go, Rust, etc.)
- [ ] Code coverage dans les résultats de tests
- [ ] Métriques Prometheus pour monitoring avancé

---

**Date de complétion :** 2025-01-15  
**Version :** Sprint 2 - Essentials Complete ✅
