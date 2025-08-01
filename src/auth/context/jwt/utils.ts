// routes
import { paths } from 'src/routes/paths';
// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------
// let expiredTimer: ReturnType<typeof setTimeout>; // Explicitly declare the type

export const tokenExpired = (exp: number) => {
  
  // eslint-disable-next-line prefer-const
  const currentTime = Date.now();

  // Test token expires after 10s
  // const timeLeft = currentTime + 10000 - currentTime; // ~10s
  const timeLeft = exp * 1000 - currentTime;

  if(timeLeft <= 0){
    alert('Token Expired');
    window.location.href = paths.auth.jwt.login;
    // return;
  }

  // clearTimeout(expiredTimer);

  // expiredTimer = setTimeout(() => {
  //   alert('Token expired');
  //   sessionStorage.removeItem('accessToken');
  //   window.location.href = paths.auth.jwt.login;
  // }, timeLeft);

};

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  try{
    if (accessToken) {
      // sessionStorage.setItem('accessToken', accessToken);
      localStorage.setItem('accessToken', accessToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // This function below will handle when token is expired
      const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
      tokenExpired(exp);
    } else {
      // sessionStorage.removeItem('accessToken');
      localStorage.removeItem('accessToken');

      delete axios.defaults.headers.common.Authorization;
    }
  }catch(error){
    alert(error)
  }
};
