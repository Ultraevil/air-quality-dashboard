import 'primeicons/primeicons.css';
import 'leaflet/dist/leaflet.css';
import '@/assets/styles/base.css';

import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { wisedPreset } from '@/app/theme/primevuePreset';
import { router } from '@/app/router';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: wisedPreset,
    options: {
      // We drive light/dark via our own `data-theme` attribute (tokens.css),
      // so PrimeVue's dark-mode class selector is disabled to avoid a second,
      // conflicting theme switch.
      darkModeSelector: false,
    },
  },
});

app.mount('#app');
