import Cookies from 'js-cookie';

export const isAuthenticated = () => {
  const token = Cookies.get('authToken');
  return !!token;
};

export const getToken = () => {
  return Cookies.get('authToken');
};

export const setToken = (token: string) => {
  Cookies.set('authToken', token, { expires: 7 });
  localStorage.setItem('authToken', token);
};

export const removeToken = () => {
  Cookies.remove('authToken');
  localStorage.removeItem('authToken');
}; 