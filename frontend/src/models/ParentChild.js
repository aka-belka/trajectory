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
      if (err.message === 'HTTP 404: Not Found') {
        throw new Error('Родитель с таким email не найден');
      }
      if (err.message === 'HTTP 409: Conflict') {
        // Пытаемся извлечь сообщение из ошибки
        if (err.message.includes('уже привязан')) {
          throw new Error('Этот родитель уже привязан к вашему аккаунту');
        }
        if (err.message.includes('уже было отправлено')) {
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

  static async getChildren() {
    const data = await api.get('/parent/children');
    
    return data.map(item => new ParentChild(
      null,
      null,
      item.user_id,
      item.full_name || `Ученик #${item.user_id}`, 
      item.linked_at,
      null,
      'accepted'
    ));
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