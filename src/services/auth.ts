import axios from "axios";
import api from "./axiosInstance";

let BASE_URL = "";

interface PersonnelCountResponse {
  count: number;
  results: any[];
}

export const UsersService = {
  list() {
    return api.get("/users/");
  },

  create(data: any) {
    return api.post("/users/", data);
  },

  update(id: number, data: any) {
    return api.patch(`/users/${id}/`, data);
  },

  delete(id: number) {
    console.log("id ", id);
    return api.delete(`/users/${id}/`);
  },
  search(query: any) {
    return api.get(`${BASE_URL}search/?q=${query}`);
  },

  getTotalCount() {
    return api.get<PersonnelCountResponse>(`${BASE_URL}?limit=1`);
  },

  listRole() {
    return api.get("/roles/");
  },
};

export interface Role {
  id: number;
  name: string;
}

export interface Users {
  id: number;
  first_name: string;
  last_name: string;
  maternal_name: string;
  username: string;
  phone: number;
  email: string;
  password: string;
  role: number | null;
  role_data?: Role | null;
  is_active: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  maternal_name: string;
  username: string;
  phone: number;
  email: string;
  password: string;
  role: number;
  is_active: boolean;
}

export interface AuthTokenResponse {
  access: string;
  refresh: string;
}

export const auth = async (username: string, password: string) => {
  BASE_URL = "/token/";
  try {
    const res = await api.post<AuthTokenResponse>(`${BASE_URL}`, {
      username,
      password,
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error(
        "Credenciales inválidas. Por favor, revise su nombre de usuario y contraseña.",
      );
    }
    throw error;
  }
};

export const authRegister = async (data: RegisterData) => {
  BASE_URL = "/register/";
  try {
    console.log("data: ", data);
    const res = await api.post(`${BASE_URL}`, data);

    return res.data;
  } catch (error: any) {
    console.log("Error de registro: ", error.response?.data);
    throw error.response?.data || { error: "Error en el registro" };
  }
};
export default auth;

// import axios from "axios";
//
// const BASE_URL = import.meta.env.VITE_API_URL;
//
// export interface RegisterData {
//   first_name: string;
//   last_name: string;
//   maternal_name: string;
//   username: string;
//   phone: number;
//   email: string;
//   password: string;
//   role: number;
//   is_active: boolean;
// }
//
// export interface AuthTokenResponse {
//   access: string;
//   refresh: string;
// }
//
// export const auth = async (username: string, password: string) => {
//   try {
//     const res = await axios.post<AuthTokenResponse>(`${BASE_URL}/token/`, {
//       username,
//       password,
//     });
//
//     return res.data;
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response?.status === 401) {
//       throw new Error(
//         "Credenciales inválidas. Por favor, revise su nombre de usuario y contraseña.",
//       );
//     }
//     throw error;
//   }
// };
//
// export const authRegister = async (data: RegisterData) => {
//   try {
//     console.log("data: ", data);
//     const res = await axios.post(`${BASE_URL}/register/`, data);
//
//     return res.data;
//   } catch (error: any) {
//     console.log("Error de registro: ", error.response?.data);
//     throw error.response?.data || { error: "Error en el registro" };
//   }
// };
// export default auth;
