import axios from 'axios';

axios.baseURL = 'localhost:8000';

function get(endpoint) {
  return axios.get(endpoint);
}

const exported = Object.freeze({ get });
export default exported;
