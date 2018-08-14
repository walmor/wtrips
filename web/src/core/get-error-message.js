import ApiClientError from './api-client-error';

export default function setErrorMessage(err, setError) {
  const genericMsg = 'An error has occured. Try again.';

  if (err instanceof ApiClientError) {
    if (err.handled) return;

    let msg = err.message || genericMsg;
    if (err.errors) [msg] = err.errors;

    setError(msg);
  } else {
    setError(err.message || genericMsg);
  }
}
