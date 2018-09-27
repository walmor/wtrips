import axios from 'axios';
import { message } from 'antd';
import config from './config';
import ApiClientError from './api-client-error';

const BASE_ENDPOINT = config.apiBaseEndPoint;

class ApiClient {
  constructor() {
    this.onUnauthorizedCallbacks = [];
    this.onForbiddenCallbacks = [];
    this.onNotFoundCallbacks = [];
  }

  async get(url, params) {
    return this.request('get', url, null, params);
  }

  async post(url, data) {
    return this.request('post', url, data);
  }

  async put(url, data, params) {
    return this.request('put', url, data, params);
  }

  async delete(url, params) {
    return this.request('delete', url, null, params);
  }

  async request(method, url, data, params) {
    try {
      return (await axios({
        method,
        url: BASE_ENDPOINT + url,
        data,
        params,
      })).data;
    } catch (err) {
      throw this.handleRequestError(err);
    }
  }

  onUnauthorized(cb) {
    this.onUnauthorizedCallbacks.push(cb);
  }

  onForbidden(cb) {
    this.onForbiddenCallbacks.push(cb);
  }

  onNotFound(cb) {
    this.onNotFoundCallbacks.push(cb);
  }

  setToken(token) {
    axios.defaults.headers.common = {
      Authorization: `Bearer ${token}`,
    };
  }

  clearToken() {
    axios.defaults.headers.common = null;
  }

  handleRequestError(err) {
    let clientError = null;

    if (err.response) {
      const msg = err.response.data && err.response.data.message;
      const errors = err.response.data && err.response.data.errors;
      if (err.response.status === 401) {
        clientError = new ApiClientError(msg || 'User not authenticated.', true);
        this.onUnauthorizedCallbacks.forEach(cb => cb(clientError));
      } else if (err.response.status === 403) {
        clientError = new ApiClientError(msg || 'Access denied.', true);
        this.onForbiddenCallbacks.forEach(cb => cb(clientError));
      } else if (err.response.status === 404) {
        clientError = new ApiClientError(msg || 'Resource not found.', true);
        this.onNotFoundCallbacks.forEach(cb => cb(clientError));
      } else if (err.response.status === 500) {
        clientError = new ApiClientError(msg || 'Internal Server Error.', true);
        message.error('An unexpected error has ocurred. Try again.');
      } else {
        clientError = new ApiClientError(msg || 'An error has occurred.', false, errors);
      }
    } else {
      clientError = new ApiClientError('Network error', true);
      message.error('Error trying to connect to the server. Try again.');
    }

    return clientError;
  }
}

export default ApiClient;
