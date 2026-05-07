import ProfessionComponent from './ProfessionComponent';

class ProfessionGroup extends ProfessionComponent {
  #name = null;
  #description = null;
  #children = [];

  constructor(name, description) {
    super();
    this.#name = name;
    this.#description = description;
    this.#children = [];
  }

  add(component) {
    if (!(component instanceof ProfessionComponent)) {
      throw new Error('Можно добавлять только объекты ProfessionComponent');
    }
    this.#children.push(component);
  }

  remove(component) {
    const index = this.#children.indexOf(component);
    if (index !== -1) {
      this.#children.splice(index, 1);
    }
  }

  getName() {
    return this.#name;
  }

  getDescription() {
    return this.#description;
  }

  getType() {
    return 'group';
  }

  getDetails() {
    let details = `Группа: ${this.#name}\n`;
    details += `Описание: ${this.#description}\n`;
    details += `Количество элементов: ${this.#children.length}\n\n`;
    details += `Содержимое:\n`;
    
    for (const child of this.#children) {
      details += `   - ${child.getName()}\n`;
    }
    
    return details;
  }

  getChildren() {
    return [...this.#children];
  }

  getChildrenCount() {
    return this.#children.length;
  }

  isGroup() {
    return true;
  }

  isLeaf() {
    return false;
  }

  findByName(name) {
    for (const child of this.#children) {
      if (child.getName() === name) {
        return child;
      }
      if (child.isGroup()) {
        const found = child.findByName(name);
        if (found) return found;
      }
    }
    return null;
  }

  getAllProfessions() {
    let professions = [];
    
    for (const child of this.#children) {
      if (child.isLeaf()) {
        professions.push(child.getProfession());
      } else if (child.isGroup()) {
        professions = professions.concat(child.getAllProfessions());
      }
    }
    
    return professions;
  }
}

export default ProfessionGroup;