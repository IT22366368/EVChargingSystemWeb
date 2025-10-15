// Cookie utility functions
export const setCookie = (name, value) => {
  if (typeof document === "undefined") return;

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";

  // Use SameSite=Lax by default for local dev so cookies are accepted by the browser.
  document.cookie = `${name}=${JSON.stringify(value)}; Path=/; SameSite=Lax${secureFlag}`;
};

export const getCookie = (name) => {
  if (typeof document === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (e) {
        console.error("Error parsing cookie:", e);
        return null;
      }
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  if (typeof document === "undefined") return;

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";

  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${secureFlag}`;
};
