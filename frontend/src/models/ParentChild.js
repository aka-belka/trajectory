import api from '../api/api';

class ParentChild {
  #id = null;
  #parentId = null;
  #studentId = null;
  #name = null;
  #linkedAt = null;
  #invitationToken = null;
  #invitationStatus = null;

  constructor(id, parentId, studentId, name, linkedAt, invitationToken, invitationStatus) {
    this.#id = id;
    this.#parentId = parentId;
    this.#studentId = studentId;
    this.#name = name;
    this.#linkedAt = linkedAt;
    this.#invitationToken = invitationToken;
    this.#invitationStatus = invitationStatus;
  }

  getId() { return this.#id; }
  getParentId() { return this.#parentId; }
  getStudentId() { return this.#studentId; }
  getName() { return this.#name; } 
  getLinkedAt() { return this.#linkedAt; }
  getInvitationToken() { return this.#invitationToken; }
  getInvitationStatus() { return this.#invitationStatus; }

  static async getParents(studentId) {
    const data = await api.get(`/student/parents/${studentId}`);

    return data.map(item => new ParentChild(
      item.parent_child_id,
      item.parent_id,
      item.student_id,
      item.full_name || `Родитель #${item.parent_id}`, 
      item.linked_at,
      item.invitation_token,
      item.invitation_status
    ));
  }

  static async sendInvitation(parentEmail) {
    try {
      await api.post('/parent/invite', { parentEmail });
      return true;
    } catch (err) {
      if (err.response?.status === 404) {
        throw new Error('Родитель с таким email не найден');
      }
      if (err.response?.status === 409) {
        const serverMessage = err.response?.data?.error || '';
        if (serverMessage.includes('уже привязан')) {
          throw new Error('Этот родитель уже привязан к вашему аккаунту');
        }
        if (serverMessage.includes('уже было отправлено')) {
          throw new Error('Приглашение уже было отправлено. Дождитесь ответа.');
        }
        throw new Error('Приглашение уже существует');
      }
      throw err;
    }
  }

  static async acceptInvitation(token) {
    await api.post('/parent/accept', { token });
    return true;
  }

  static async getPendingInvitations() {
    const allInvites = await ParentChild.getInvitations();
    return allInvites.filter(inv => inv.getInvitationStatus() === 'pending');
  }

  static async rejectInvitation(token) {
    await api.post('/parent/reject', { token });
    return true;
  }

  async unlink() {
    await api.delete(`/parent/child/${this.#id}`);
    return true;
  }

  static async getInvitations() {
  const data = await api.get('/parent/invitations');
  
  return data.map(item => new ParentChild(
    item.parent_child_id,
    item.parent_id,
    item.student_id,
    item.full_name || `Ученик #${item.student_id}`,
    item.linked_at,
    item.invitation_token,
    item.invitation_status
  ));
}
}

export default ParentChild;