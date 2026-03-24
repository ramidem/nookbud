import { AppRegistry } from 'react-native';

import App from '@/app';

AppRegistry.registerComponent('main', () => App);
AppRegistry.runApplication('main', {
  rootTag: document.getElementById('root'),
});
