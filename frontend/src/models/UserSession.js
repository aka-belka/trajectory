import api from '../api/api';

class UserSession {
  #id = null;
  #userId = null;
  #sessionToken = null;

  constructor(id, userId, sessionToken) {
    this.#id = id;
    this.#userId = userId;
    this.#sessionToken = sessionToken;
  }

  getId() { return this.#id; }
  getUserId() { return this.#userId; }
  getSessionToken() { return this.#sessionToken; }
  
  static async createSession(userId) {
    const token = localStorage.getItem('token');
    return token;
  }

  static saveRedirectIntent(url) {
    localStorage.setItem('redirectIntent', url);
  }

  static getRedirectIntent() {
    return localStorage.getItem('redirectIntent');
  }

  static clearRedirectIntent() {
    localStorage.removeItem('redirectIntent');
  }

  static async destroySession(sessionToken) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('redirectIntent');
  }
}

export default UserSession;