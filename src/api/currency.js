import axios from './axios';
import { ENDPOINTS } from '@/services/endpoints';

export const currencyApi = {
  convertCurrency: (amount, from, to, options = {}) => 
    axios.get(ENDPOINTS.CURRENCY.CONVERT + `?amount=${amount}&from=${from}&to=${to}`, options)
};
