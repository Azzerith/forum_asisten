// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

export const login = (data) => api.post('/login', data);
export const getProgramStudi = () => api.get('/program-studi');
export const getMataKuliah = () => api.get('/mata-kuliah');
export const getJadwal = () => api.get('/jadwal');
export const getRekapitulasi = () => api.get('/rekapitulasi');