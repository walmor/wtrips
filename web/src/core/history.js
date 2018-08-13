import { createBrowserHistory } from 'history';
import { getCurrentRoute } from './routes';

const history = createBrowserHistory();

history.listen((location) => {
  saveCurrentRoute(location);
});

function saveCurrentRoute(location) {
  const currentRoute = getCurrentRoute(location.pathname);
  return currentRoute;
  // TODO: save on mobx store
}

saveCurrentRoute(history.location);

export default history;
