# WebSocket Documentation

## Overview

Le backend Chef supporte maintenant les mises à jour en temps réel via WebSocket pour suivre la progression des builds.

## Configuration

### Variables d'environnement

```bash
WEBSOCKET_ENABLED=true
WEBSOCKET_CORS_ORIGIN=*  # ou domaine spécifique
```

## Connexion

### Endpoint WebSocket

```
ws://localhost:3001/ws
```

### Exemple de connexion (Client JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  path: '/ws',
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});
```

## Événements

### S'abonner aux mises à jour d'un job

```javascript
// S'abonner à un job spécifique
socket.emit('subscribe:job', 'job-id-123');

// Recevoir les mises à jour de progression
socket.on('job:progress', (data) => {
  console.log('Progress:', data);
  /*
  {
    jobId: 'job-id-123',
    projectId: 'project-id-456',
    status: 'building',
    progress: 50,
    message: 'Running build...',
    phase: 'building'
  }
  */
});

// Recevoir les logs en temps réel
socket.on('job:log', (log) => {
  console.log('Log:', log);
});

// Recevoir l'événement de complétion
socket.on('job:completed', (result) => {
  console.log('Job completed:', result);
});

// Recevoir les erreurs
socket.on('job:error', (error) => {
  console.error('Job error:', error);
});

// Se désabonner
socket.emit('unsubscribe:job', 'job-id-123');
```

### S'abonner aux mises à jour d'un projet

```javascript
// S'abonner à un projet
socket.emit('subscribe:project', 'project-id-456');

// Recevoir les mises à jour
socket.on('project:progress', (data) => {
  console.log('Project progress:', data);
});

socket.on('project:completed', (result) => {
  console.log('Project completed:', result);
});

// Se désabonner
socket.emit('unsubscribe:project', 'project-id-456');
```

## Phases de Build

Les phases suivantes sont envoyées via WebSocket :

| Phase | Progress | Description |
|-------|----------|-------------|
| `queued` | 0% | Job en file d'attente |
| `preparing` | 10% | Préparation du filesystem |
| `installing` | 30% | Installation des dépendances |
| `building` | 50% | Exécution du build |
| `building` | 70% | Exécution des tests |
| `completed` | 90% | Collection des artifacts |
| `completed` | 100% | Build terminé |

## Exemple Complet (React)

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function BuildProgress({ jobId, projectId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('queued');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      path: '/ws',
    });

    socket.on('connect', () => {
      // S'abonner aux updates du job
      socket.emit('subscribe:job', jobId);
    });

    socket.on('job:progress', (data) => {
      setProgress(data.progress);
      setStatus(data.status);
    });

    socket.on('job:log', (log) => {
      setLogs(prev => [...prev, log]);
    });

    socket.on('job:completed', (result) => {
      console.log('Build completed!', result);
    });

    socket.on('job:error', (error) => {
      console.error('Build failed!', error);
    });

    return () => {
      socket.emit('unsubscribe:job', jobId);
      socket.disconnect();
    };
  }, [jobId]);

  return (
    <div>
      <h2>Build Progress: {progress}%</h2>
      <p>Status: {status}</p>
      <div className="logs">
        {logs.map((log, i) => (
          <div key={i}>{log.message}</div>
        ))}
      </div>
    </div>
  );
}
```

## Monitoring

### Vérifier les clients connectés

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "websocket": {
    "enabled": true,
    "connected_clients": 5
  }
}
```

## Sécurité

### CORS

Configurez `WEBSOCKET_CORS_ORIGIN` pour restreindre les origines autorisées :

```bash
# Autoriser tous les domaines (développement seulement)
WEBSOCKET_CORS_ORIGIN=*

# Autoriser un domaine spécifique (production)
WEBSOCKET_CORS_ORIGIN=https://app.example.com

# Autoriser plusieurs domaines
WEBSOCKET_CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

### Authentification (Optionnel)

Pour ajouter l'authentification :

```javascript
const socket = io('http://localhost:3001', {
  path: '/ws',
  auth: {
    token: 'your-jwt-token'
  }
});
```

Et côté serveur dans `websocket.ts` :

```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Vérifier le token
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

## Troubleshooting

### Les clients ne reçoivent pas les updates

1. Vérifiez que `WEBSOCKET_ENABLED=true` dans `.env`
2. Vérifiez que le client s'est bien abonné avec `subscribe:job` ou `subscribe:project`
3. Vérifiez les CORS si le client est sur un domaine différent

### Connexion WebSocket échoue

1. Vérifiez que le serveur écoute sur le bon port
2. Vérifiez les proxys/firewalls qui pourraient bloquer WebSocket
3. Essayez avec `transports: ['polling']` en fallback

## Performance

- Chaque client peut s'abonner à plusieurs jobs/projects
- Les updates sont envoyés uniquement aux clients abonnés (pas de broadcast global)
- Les logs peuvent être volumineux - considérez la limitation côté client
