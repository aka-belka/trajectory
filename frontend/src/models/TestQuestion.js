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
  getQuestionText() { return this.#questionText; }
  getOptionA() { return this.#optionA; }
  getOptionB() { return this.#optionB; }
  getOptionAType() { return this.#optionAType; }
  getOptionBType() { return this.#optionBType; }
  getOrderNumber() { return this.#orderNumber; }

  getQuestion() {
    return this.#questionText;
  }

  getOptions() {
    return [this.#optionA, this.#optionB];
  }

   //Получить тип профессии для варианта A
  getOptionATypeLetter() {
    return this.#optionAType;
  }

  //Получить тип профессии для варианта B
  getOptionBTypeLetter() {
    return this.#optionBType;
  }

  getTypeName(letter) {
    const typeMap = {
      'П': 'Человек — Природа',
      'Т': 'Человек — Техника',
      'Ч': 'Человек — Человек',
      'З': 'Человек — Знаковая система',
      'Х': 'Человек — Художественный образ'
    };
    return typeMap[letter] || letter;
  }

  isValidAnswer(answer) {
    return answer === 'A' || answer === 'B';
  }

  getTypeForAnswer(answer) {
    if (answer === 'A') return this.#optionAType;
    if (answer === 'B') return this.#optionBType;
    return null;
  }
}

export default TestQuestion;