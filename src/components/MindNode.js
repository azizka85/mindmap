export default class MindNode extends HTMLLIElement {
  #context;  
  #mindNode = {
    id: Date.now(),
    label: '',
    mindNodes: []
  };

  #article;
  #ul;  

  parentMindNode;

  #numClicks;
  #childrenCollapsed;

  constructor() {
    super();    

    this.#numClicks = 0;
    this.#childrenCollapsed = false;

    if(this.children.length > 0) {
      this.#article = this.children[0];
    } else {
      this.#article = document.createElement('article');
      this.appendChild(this.#article);
    }

    if(this.children.length > 1) {
      this.#ul = this.children[1];
    } else {
      this.#ul = document.createElement('ul');      
      this.appendChild(this.#ul);
    }

    this.#article.oninput = this.onNodeInput.bind(this);
    this.#article.onclick = this.onNodeClicked.bind(this);
    this.#article.onkeydown = this.onNodeKeyPressed.bind(this);

    this.index = 1;
  }

  static get observedAttributes() { return ['data-label', 'data-index']; }

  set #listVisible(value) {
    this.#ul.style.display = value ? '' : 'none';   
  }

  get context() {
    return this.#context;
  }

  set context(ctx) {
    this.#context = ctx;

    for(let i = 0; i < this.#ul.children.length; i++) {
      this.#ul.children.item(i).context = ctx;
    }
  }  

  get label() {
    return this.getAttribute('data-label');
  }

  set label(value) {
    this.setAttribute('data-label', value);
  }

  get mid() {
    return +this.getAttribute('data-index');
  }

  set mid(value) {
    this.setAttribute('data-index', value);
  }

  get index() {
    return this.#article.tabIndex;
  }

  set index(value) {
    this.#article.tabIndex = value;
  }

  get mindNode() {
    return this.#mindNode;
  }

  set mindNode(node) {
    this.#mindNode = node;
    this.label = node.label;
    this.mid = node.id;

    this.updateMindNodes(node.mindNodes);
  }

  get collapsed() {
     return this.#article.classList.contains('collapsed');
  }

  set collapsed(value) {
    if(value) {
      this.#article.classList.add('collapsed');
    } else {
      this.#article.classList.remove('collapsed');
    }
    this.#listVisible = this.#ul.children.length > 0 && !value;
  }

  get editable() {
    return this.#article.classList.contains('editable');
  }

  set editable(value) {
    this.#article.contentEditable = value ? 'true' : 'false';

    if(value) {
      this.#article.classList.add('editable');
    } else {
      this.#article.classList.remove('editable');
    }   
  }

  get active() {
    return this.#article.classList.contains('active');
  }

  set active(value) {
    if(value) {
      this.#article.classList.add('active');
      this.#article.focus();
    } else {
      this.#article.classList.remove('active');
      this.#article.blur();
    } 
  }

  initMindNodes() {
    this.mindNode.mindNodes = [];

    if(this.#ul.children.length > 0) {
      this.#listVisible = true;

      for(let i = 0; i < this.#ul.children.length; i++) {
        this.#ul.children.item(i).parentMindNode = this;
        this.#ul.children.item(i).initMindNodes();
        this.mindNode.mindNodes.push(this.#ul.children.item(i).mindNode);
      }
    } else {
      this.#listVisible = false;
    }
  }

  createMindNode() {
    const newNode = {
      id: Date.now(),
      label: '',
      mindNodes: []       
    };    

    const item = new MindNode();

    item.parentMindNode = this;
    item.context = this.context;
    item.mindNode = newNode;
    item.editable = true;
    
    this.#ul.appendChild(item);
    this.mindNode.mindNodes.push(newNode);

    if(this.context) {
      this.context.toolBar.canSave = true;
      this.context.toolBar.activeNode = item;
    }

    this.collapsed = false;
  }

  removeMindNode(item) {    
    const index = this.mindNode.mindNodes.findIndex(elem => elem.id === item.mindNode.id);
    const length = this.mindNode.mindNodes.length;

    if(length < 2) this.#listVisible = false;
    
    this.mindNode.mindNodes.splice(index, 1);    
    this.#ul.removeChild(item);

    if(this.context) {
      this.context.toolBar.canSave = true;
    }

    let focusIndex = length - 2;

    if(length > index + 1) {
      focusIndex = index;
    }

    if(focusIndex >= 0) {
      this.moveToMindNode(focusIndex); 
    } else if(this.context) {
      this.context.toolBar.activeNode = this;
    }       
  }  

  attributeChangedCallback(name, oldValue, newValue) {
    if(newValue !== oldValue) {
      switch(name) {
        case 'data-label':
          this.updateLabel(newValue);       
          break;
        case 'data-index':
          this.updateMindId(newValue); 
          break;
      }
    }
  }

  updateLabel(value) {
    this.mindNode.label = value;    
    this.#article.textContent = this.label;
  }

  updateMindId(value) {
    this.mindNode.id = +value;
    // this.#article.tabIndex = +value;
  }

  updateMindNodes(mindNodes = []) {
    this.mindNode.mindNodes = mindNodes;

    this.#ul.innerHTML = '';

    if(mindNodes.length > 0) {
      this.#listVisible = true;

      mindNodes.forEach(node => {
        const item = new MindNode();

        item.parentMindNode = this;
        item.context = this.context;        
        item.mindNode = node;        

        this.#ul.appendChild(item);
      });
    } else {
      this.#listVisible = false;
    }
  }

  updateMindNodesCollapsed(collapsed) {
    this.collapsed = false;

    this.#ul.children.forEach(child => {
      child.collapsed = collapsed;
    });
  }  

  canMoveToLeftNode() {
    return this.parentMindNode.mid !== undefined;
  }

  canMoveToRightNode() {
    return !this.collapsed && this.mindNodesCount() > 0;
  }

  canMoveToUpNode() {
    const index = this.parentMindNode.mindNodeIndex(this);

    return index > 0;
  }

  canMoveToDownNode() {
    const index = this.parentMindNode.mindNodeIndex(this);
    const length = this.parentMindNode.mindNodesCount();
    
    return index >= 0 && index < length - 1;
  }

  moveToLeftNode() {
    if(this.context && this.canMoveToLeftNode()) {
      this.context.toolBar.activeNode = !this.parentMindNode.mid ? undefined : this.parentMindNode;
    }
  }

  moveToRightNode() {
    if(this.canMoveToRightNode()) {
      const index = Math.floor((this.mindNodesCount() - 1) / 2);      
      
      this.moveToMindNode(index);
    }
  }

  moveToUpNode() {
    if(this.canMoveToUpNode()) {
      const index = this.parentMindNode.mindNodeIndex(this);
      
      this.parentMindNode.moveToMindNode(index - 1);
    }
  }

  moveToDownNode() {
    if(this.canMoveToDownNode()) {
      const index = this.parentMindNode.mindNodeIndex(this);
      
      this.parentMindNode.moveToMindNode(index + 1);
    }
  }  

  mindNodesCount() {
    return this.mindNode.mindNodes.length;
  }

  mindNodeIndex(item) {
    return this.mindNode.mindNodes.findIndex(elem => elem.id === item.mindNode.id);
  }

  moveToMindNode(index) {
    if(this.context && index < this.#ul.children.length) {
      this.context.toolBar.activeNode = this.#ul.children.item(index);
    }
  }

  onNodeInput() { 
    this.label = this.#article.textContent.replace(/(<([^>]+)>)/gi, "")
  }

  onNodeClicked(evt) {
    evt.stopPropagation();

    this.#numClicks++;

    if(!this.active && this.context) {
      this.context.toolBar.activeNode = this;
    } else {
      this.collapsed = !this.collapsed;
    }

    setTimeout(() => {
      if(this.#numClicks > 1 && !this.editable) {
        this.editable = true;
      }
      this.#numClicks = 0;
    }, 300);
  };

  onNodeKeyPressed(evt) {
    if(evt.code === 'Space' && !this.editable) {
      evt.preventDefault();
      
      this.editable = true;
    } else if(evt.code === 'Tab') {
      evt.preventDefault();

      this.createMindNode();
    } else if(evt.code === 'Enter' || evt.code === 'NumpadEnter') {
      evt.preventDefault();

      if(!this.editable) {        
        this.parentMindNode.createMindNode();        
      } else {
        this.editable = false;
      }
    } else if(evt.code === 'Delete') {
      if(!this.editable) {
        this.parentMindNode.removeMindNode(this);
      }
    } else if(evt.code === 'ArrowLeft' || evt.code === 'Numpad4') {
      if(!this.editable) {
        this.moveToLeftNode();
      }
    } else if(evt.code === 'ArrowRight' || evt.code === 'Numpad6') {
      if(!this.editable) {        
        this.moveToRightNode();
      } 
    } else if(evt.code === 'ArrowUp' || evt.code === 'Numpad8') {
      this.moveToUpNode();
    } else if(evt.code === 'ArrowDown' || evt.code === 'Numpad2') {
      this.moveToDownNode();
    } else if(evt.code === 'KeyD') {
      if(evt.shiftKey) {
        if(!this.editable) {
          this.#childrenCollapsed = !this.#childrenCollapsed;
  
          this.updateMindNodesCollapsed(this.#childrenCollapsed);       
        }
      } else {
        if(!this.editable) {
          this.collapsed = !this.collapsed;
        }
      }      
    }
  }
}
