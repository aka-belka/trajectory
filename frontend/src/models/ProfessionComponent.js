class ProfessionComponent {

  getName() {
    throw new Error('Метод getName() должен быть реализован');
  }

  getDescription() {
    throw new Error('Метод getDescription() должен быть реализован');
  }

  getType() {
    throw new Error('Метод getType() должен быть реализован');
  }

  getDetails() {
    throw new Error('Метод getDetails() должен быть реализован');
  }

  isGroup() {
    return false;
  }

  isLeaf() {
    return false;
  }
}

export default ProfessionComponent;