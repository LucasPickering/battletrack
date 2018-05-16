import axios from 'axios';

axios.baseURL = 'localhost:4000';

function get(endpoint) {
  return axios.get(endpoint);
}

const exported = { get };
export default exported;
