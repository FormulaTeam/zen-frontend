export const logoutAction = () => {
  localStorage.removeItem("user");
  if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/comeback")) {
    window.location.href = "/login";
  }
};
