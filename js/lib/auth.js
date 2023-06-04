import luri from "./luri.js";

let u = null;

class AuthManager {

  login(user) {
    if (!user) {
      return;
    }

    u = user;

    luri.emit("LoggedIn", user);
  }

  logout() {
    let x = u;

    u = null;
    
    luri.emit("LoggedOut", x);
  }

  logged() {
    return !!u;
  }

  user() {
    return u;
  }

  throwable = Error

  require(message) {
    if (!this.logged()) {
      throw new this.throwable(message);
    }
  }
}

let auth = new AuthManager;

export default auth;