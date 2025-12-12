import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { Checkbox, Input, Label } from "../form";
import { themeConfig } from "../../configs";
import auth, { authRegister } from "../../services/auth";
import { useAuth } from "../../@core";
import { jwtDecode } from "jwt-decode";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    maternal_name: "",
    username: "",
    phone: 0,
    email: "",
    password: "",
    role: 6,
    is_active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await authRegister(formData);
      const data = await auth(formData.username, formData.password);
      if (!data || !data.access) {
        throw new Error(
          "El registro fue exitoso, pero no se recibió el token de acceso.",
        );
      }
      localStorage.setItem("token", data.access);

      try {
        const decoded = jwtDecode<Record<string, unknown>>(data.access);
        console.log("Token decodificado:", decoded);
      } catch (tokenError) {
        console.warn("No se pudo decodificar el token para log:", tokenError);
      }

      login(data.access);
      navigate("/");
      // localStorage.setItem("refresh", data.refresh);
      const decoded = jwtDecode<Record<string, unknown>>(data.access);
      console.log("Token decodificado crudo:", decoded);
      setMessage("Usuario registrado exitosamente ✅");
    } catch (error: any) {
      setMessage(error.error || "Error al registrar usuario ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Retornar
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div>
            <h4 className="dark:text-white">{`Bienvenido a ${themeConfig.templateName}!👋🏻`}</h4>
          </div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Crear Cuenta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingrese sus datos para crearte una cuenta!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nombre<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="first_name"
                      name="first_name"
                      onChange={handleChange}
                      placeholder="Ingrese su nombre"
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Apellido Paterno<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="last_name"
                      name="last_name"
                      onChange={handleChange}
                      placeholder="Ingrese su apellido paterno"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Maternal Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Apellido Materno<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="maternal_name"
                      name="maternal_name"
                      onChange={handleChange}
                      placeholder="Ingrese su apellido materno"
                    />
                  </div>
                  {/* <!-- Username --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Usuario<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      onChange={handleChange}
                      placeholder="Ingrese un usuario"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Phone --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Telefono<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="phone"
                      name="phone"
                      onChange={handleChange}
                      placeholder="Ingrese numero de telefono"
                    />
                  </div>
                  {/* <!-- Email --> */}
                  <div>
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      onChange={handleChange}
                      placeholder="Ingrese su correo"
                    />
                  </div>
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      onChange={handleChange}
                      placeholder="Ingrese una Contraseña"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    Al crear una cuenta significa que aceptas los{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terminos y Condiciones,
                    </span>{" "}
                    y nuestra{" "}
                    <span className="text-gray-800 dark:text-white">
                      Política de Privacidad
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-lime-700 shadow-theme-xs hover:bg-lime-800"
                  >
                    {loading ? "Registrando..." : "Registrarse"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Ya tienes cuenta? {""}
                <Link
                  to="/signin"
                  className="text-lime-600 hover:text-lime-700 dark:text-lime-400"
                >
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
