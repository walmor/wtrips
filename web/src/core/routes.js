const routes = [
  createRoute('/admin/users', 'Users', 'users'),
  createRoute('/admin/travelplan', 'Travel plan', 'travelplan'),
  createRoute('/admin/trips', 'Trips', 'trips'),
  createRoute('/admin', 'Home', 'home'),
  createRoute('/signin', 'Sign In', 'signin'),
  createRoute('/signup', 'Sign Up', 'signup'),
];

function createRoute(pathPattern, title, menuKey) {
  return {
    pathPattern,
    title,
    menuKey,
    __typename: 'Route',
  };
}

function getCurrentRoute(path) {
  const route = getRouteByPath(path);

  if (!route) return null;

  return {
    ...route,
    breadcrumbs: getBreadcrumbs(path),
  };
}

function getBreadcrumbs(path) {
  const breadcrumbs = [];
  // Remove trailing slashes
  const currentPath = path.replace(/\/+$/, '');
  let nextSlashIndex = currentPath.indexOf('/', 1);

  while (nextSlashIndex > -1) {
    const pathSlice = currentPath.substr(0, nextSlashIndex);
    const route = getRouteByPath(pathSlice);

    if (route) {
      breadcrumbs.push({
        path: pathSlice,
        title: route.title,
        __typename: 'Breadcrumb',
      });
    }

    nextSlashIndex = currentPath.indexOf('/', nextSlashIndex + 1);
  }

  return breadcrumbs;
}

function getRouteByPath(path) {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    if (path.match(new RegExp(route.pathPattern))) {
      return route;
    }
  }

  return null;
}

export { routes, getCurrentRoute };
