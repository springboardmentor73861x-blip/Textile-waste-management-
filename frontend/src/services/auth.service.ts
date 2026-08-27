import api from "@/lib/axios";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function loginUser(data: LoginData) {
  const formData = new URLSearchParams();

  // OAuth2PasswordRequestForm expects "username"
  formData.append("username", data.email);
  formData.append("password", data.password);

  const response = await api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}