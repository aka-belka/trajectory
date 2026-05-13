import api from '../api/api';

class TestQuestion {
  #id = null;
  #questionText = null;
  #optionA = null;
  #optionB = null;
  #optionAType = null;
  #optionBType = null;
  #orderNumber = null;

  constructor(id, questionText, optionA, optionB, optionAType, optionBType, orderNumber) {
    this.#id = id;
    this.#questionText = questionText;
    this.#optionA = optionA;
    this.#optionB = optionB;
    this.#optionAType = optionAType;
    this.#optionBType = optionBType;
    this.#orderNumber = orderNumber;
  }

  getId() { return this.#id; }
  getOptionA() { return this.#optionA; }
  getOptionB() { return this.#optionB; }
  getOptionAType() { return this.#optionAType; }
  getOptionBType() { return this.#optionBType; }
  getOrderNumber() { return this.#orderNumber; }
  getQuestion() { return this.#questionText;}
}

export default TestQuestion;