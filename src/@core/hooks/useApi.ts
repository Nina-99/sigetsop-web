export const useApi = () => {
  const access = localStorage.getItem("access");

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${access}`,
    };
    return fetch(url, { ...options, headers });
  };

  return { fetchWithAuth };
};
