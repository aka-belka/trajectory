import ProfessionComponent from './ProfessionComponent';
import Profession from './Profession';

class ProfessionLeaf extends ProfessionComponent {
  #profession = null;

  constructor(profession) {
    super();
    this.#profession = profession;
  }

  getName() {
    return this.#profession.getTitle();
  }

  getDescription() {
    return this.#profession.getDescription();
  }

  getType() {
    return this.#profession.getProfessionType();
  }

  getDetails() {
    return this.#profession.viewDetails();
  }

  getProfession() {
    return this.#profession;
  }

  isLeaf() {
    return true;
  }

  isGroup() {
    return false;
  }
}

export default ProfessionLeaf;