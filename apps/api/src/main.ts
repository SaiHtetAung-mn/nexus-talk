import { App } from '@/core/app';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await App.create(AppModule);
  await app.start(process.env.PORT ?? 3000);
}
void bootstrap();

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
