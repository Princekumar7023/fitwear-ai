import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`FitWear AI Backend running on port ${env.PORT} [env: ${env.NODE_ENV}]`);
});
