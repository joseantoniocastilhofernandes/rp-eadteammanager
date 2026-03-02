export const SERVICES_CONTEXT = "https://api-gestao-de-ead.estudeondequiser.com.br/api"; //prod
//export const SERVICES_CONTEXT = "http://localhost:3000/api"; //dev
export const MIXPANEL_TOKEN = "32d1a11ed1eae600a6a4437dccdb4b2c";

let loggedUser = null;

export function setLoggedUser(user) {
  loggedUser = user;
  if (user) {
    sessionStorage.setItem('loggedUser', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('loggedUser');
  }
}

export function getLoggedUser() {
  if (loggedUser) {
    return loggedUser;
  }
  const stored = sessionStorage.getItem('loggedUser');

  return stored ? JSON.parse(stored) : null;
}
