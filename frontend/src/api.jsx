import axios from 'axios';

function get(endpoint) {
  return axios.get(endpoint);
}

const exported = { get };
export default exported;
