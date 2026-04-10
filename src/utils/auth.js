export const loginUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("user");
};