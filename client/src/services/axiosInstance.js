// import axios from 'axios';
// import jwt_decode from "jwt-decode";

// const axiosInstance = axios.create({
//     baseURL: 'http://localhost:8080/api',
// });

// axiosInstance.interceptors.request.use(
//     async (config) => {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             try {
//                 const decodedToken = jwt_decode(token);
//                 const isExpired = decodedToken.exp * 1000 < Date.now();
//                 if (isExpired) {
//                     try {
//                         const refreshToken = localStorage.getItem('refreshToken');
//                         if (!refreshToken) {
//                             throw new Error("No refresh token available");
//                         }
//                         const refreshResponse = await axios.post('/refresh_token', { refreshToken }); // Your refresh endpoint
//                         const newAccessToken = refreshResponse.data.accessToken;
//                         localStorage.setItem('authToken', newAccessToken);
//                         config.headers.Authorization = `Bearer ${newAccessToken}`;
//                         return config; // Retry original request
//                     } catch (refreshError) {
//                         console.error("Error refreshing token:", refreshError);
//                         localStorage.removeItem('authToken');
//                         localStorage.removeItem('refreshToken');
//                         window.location.href = '/login'; // Redirect to login
//                         return Promise.reject(refreshError);
//                     }
//                 } else {
//                     config.headers.Authorization = `Bearer ${token}`;
//                 }
//             } catch (error) {
//                 console.error("Error decoding token:", error);
//                 localStorage.removeItem('authToken');
//                 localStorage.removeItem('refreshToken');
//                 window.location.href = '/login';
//                 return Promise.reject(error);
//             }
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('authToken');
//             localStorage.removeItem('refreshToken');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;

// import jwt_decode from "jwt-decode";

// const axiosInstance = axios.create({
//     baseURL: 'http://localhost:8080/api',
// });

// axiosInstance.interceptors.request.use(
//     async (config) => {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             try {
//                 const decodedToken = jwt_decode(token);
//                 const isExpired = decodedToken.exp * 1000 < Date.now();
//                 if (isExpired) {
//                     try {
//                         const refreshToken = localStorage.getItem('refreshToken');
//                         if (!refreshToken) {
//                             throw new Error("No refresh token available");
//                         }
//                         const refreshResponse = await axios.post('/refresh_token', { refreshToken }); // Your refresh endpoint
//                         const newAccessToken = refreshResponse.data.accessToken;
//                         localStorage.setItem('authToken', newAccessToken);
//                         config.headers.Authorization = `Bearer ${newAccessToken}`;
//                         return config; // Retry original request
//                     } catch (refreshError) {
//                         console.error("Error refreshing token:", refreshError);
//                         localStorage.removeItem('authToken');
//                         localStorage.removeItem('refreshToken');
//                         window.location.href = '/login'; // Redirect to login
//                         return Promise.reject(refreshError);
//                     }
//                 } else {
//                     config.headers.Authorization = `Bearer ${token}`;
//                 }
//             } catch (error) {
//                 console.error("Error decoding token:", error);
//                 localStorage.removeItem('authToken');
//                 localStorage.removeItem('refreshToken');
//                 window.location.href = '/login';
//                 return Promise.reject(error);
//             }
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('authToken');
//             localStorage.removeItem('refreshToken');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;
