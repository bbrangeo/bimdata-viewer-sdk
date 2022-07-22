import TotoComponent from './Toto.vue';

export default {
  name: 'TotoPlugin', // The name of the plugin
  component: TotoComponent,
  window: {
    name: 'Toto',
    label: 'TotoPlugin.window_label',
    plugins: ['fullscreen'],
  },
  i18n: {
    en: {
      window_label: 'Toto'
    },
    fr: {
      window_label: 'Toto'
    },
  },
};
