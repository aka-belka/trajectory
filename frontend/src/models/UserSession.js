import api from '../api/api';

class UserSession {
  static saveRedirectIntent(url) {
    localStorage.setItem('redirectIntent', url);
  }

  static getRedirectIntent() {
    return localStorage.getItem('redirectIntent');
  }

  static clearRedirectIntent() {
    localStorage.removeItem('redirectIntent');
  }
}

export default UserSession;