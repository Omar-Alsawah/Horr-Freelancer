import axios from './axios';
import { ENDPOINTS } from './endpoints';

export const currencyApi = {
  convertCurrency: (amount, from, to) => 
    axios.get(ENDPOINTS.CURRENCY.CONVERT + `?amount=${amount}&from=${from}&to=${to}`)
};
