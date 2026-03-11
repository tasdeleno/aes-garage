import axios from 'axios';

let cache = null;
let promise = null;

export async function getSettings(apiUrl) {
  if (cache) return cache;
  if (!promise) {
    promise = axios.get(`${apiUrl}/api/settings`).then(res => {
      cache = res.data;
      return cache;
    }).catch(err => {
      promise = null;
      throw err;
    });
  }
  return promise;
}
