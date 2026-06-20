import axios from './axios';

export const currencyApi = {
  convertCurrency: (amount, from, to) => 
    axios.get(`/currency/convert?amount=${amount}&from=${from}&to=${to}`)
};
