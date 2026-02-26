import { mountApp } from './ui/app';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  mountApp(app);
}
