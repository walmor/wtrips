function getLocationOrigin() {
  const { location } = window;

  if (location.origin) {
    return location.origin;
  }

  return `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;
}

export default getLocationOrigin;
