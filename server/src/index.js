import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import stateRoute from './routes/state.js';
import usersRoute from './routes/users.js';
import exercisesRoute from './routes/exercises.js';
import workoutsRoute from './routes/workouts.js';
import eventsRoute from './routes/events.js';
import bodyWeightsRoute from './routes/bodyWeights.js';
import backupRoute from './routes/backup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');

const app = express();
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/state', stateRoute);
app.use('/api/users', usersRoute);
app.use('/api/exercises', exercisesRoute);
app.use('/api/workouts', workoutsRoute);
app.use('/api/events', eventsRoute);
app.use('/api/body-weights', bodyWeightsRoute);
app.use('/api/backup', backupRoute);

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Workout Book server listening on http://0.0.0.0:${PORT}`);
});
