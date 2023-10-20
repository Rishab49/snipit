class GradientPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.container = document.createElement("div");
    this.gradientContainer = document.createElement("div");
    this.gradient = document.createElement("div");
    this.colorPicker = document.createElement("color-picker");

    this.container.setAttribute("class", "container");
    this.gradientContainer.setAttribute("class", "gradient-container");
    this.gradient.setAttribute("class", "gradient");
    this.colorPicker.setAttribute("color", "#000");
    this.colorPicker.onChange = this.onChange.bind(this);

    this.pins = [
      new Pin(0, "#000", this.setActivePin),
      new Pin(100, "#fff", this.setActivePin),
    ];

    this.setGradient = this.pins;
    this.setActivePin = this.pins[0];

    this.gradientContainer.appendChild(this.gradient);
    this.pins.forEach((pin) => {
      this.gradientContainer.appendChild(pin.getElement);
      pin.element.addEventListener("click", () => {
        this.setActivePin = pin;
      });
      pin.element.addEventListener("pointerdown", (event) => {
        this.setActivePin = pin;
        this.activePin.element.setPointerCapture(event.pointerId);

        pin.element.onpointermove = (event) => {
          if (
            event.x > this.boundingRect.x &&
            event.x < this.boundingRect.x + this.boundingRect.width
          ) {
            let x = event.x - this.boundingRect.x;
            let percentage = (x / this.boundingRect.width) * 100;
            this.activePin.setPosition = percentage;
            this.setGradient = this.pins;
          }
        };
      });

      pin.element.addEventListener("pointerup", (event) => {
        pin.element.onpointermove = null;
        this.activePin.element.releasePointerCapture(event.pointerId);
      });
    });
    this.container.appendChild(this.gradientContainer);
    this.container.appendChild(this.colorPicker);

    this.shadowRoot.append(this.style, this.container);
  }

  get style() {
    let style = document.createElement("style");
    style.textContent = `
    *{
      margin:0;
      padding:0;
    }


    .container{
      display:flex;
      flex-direction:column;
      gap:0.5rem;
      width:100%;
    }

    .gradient-container{
      position:relative;
      height:30px;
      width:100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gradient{
      height:20px;
      width:100%;
      border-radius:15px;
    }

    .pin{
      position:absolute;
      height:75%;
      aspect-ratio:1/1;
      border-radius:5px;
      border:2px solid white;
      top:0;
      left:0;
    }

    .pin.active{
      border:3px solid white;
    }
    
    `;

    return style;
  }

  /**
   * @param {Pin} pin
   */
  set setActivePin(pin) {
    this.pins.forEach((pin) => pin.element.classList.remove("active"));
    pin.element.classList.add("active");
    this.activePin = pin;
    this.colorPicker.setColor = pin.color;
  }

  /**
   * @param {Pin[]} pins
   *
   */
  set setGradient(pins) {
    let linearGradient = pins.reduce(
      (val, e) => val + "," + e.color + " " + e.position + "% ",
      "linear-gradient(to right"
    );
    console.log(linearGradient);
    this.gradient.style.backgroundImage = linearGradient + ")";
    this.targetElement
      ? (this.targetElement.style.background = linearGradient + ")")
      : null;
  }

  connectedCallback() {
    if (this.isConnected) {
      this.targetElement = document.querySelector(
        this.getAttribute("target-element")
      );

      this.boundingRect = this.gradient.getBoundingClientRect();
    }
  }

  onChange() {
    this.activePin.setColor = this.colorPicker.colorInput.value;
    this.setGradient = this.pins;
  }
}

class Pin {
  constructor(position, color) {
    this.position = position;
    this.color = color;
    this.element = document.createElement("div");
    this.element.setAttribute("class", "pin");
    this.element.style.backgroundColor = color;
    this.element.style.left = `${position}%`;
    this.element.style.transform = `translate(-${position}%,0)`;
  }

  get getElement() {
    return this.element;
  }

  /**
   * @param {string} color
   */
  set setColor(color) {
    this.color = color;
    this.element.style.backgroundColor = color;
  }

  /**
   * @param {string} pos
   */
  set setPosition(pos) {
    this.position = pos;
    this.element.style.left = `${pos}%`;
    this.element.style.transform = `translate(-${pos}%,0)`;
  }

  /**
   * @param {string} classname
   */
  set setClass(classname) {
    this.element.setAttribute("class", classname);
  }
}

class ColorPicker extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.container = document.createElement("label");
    this.text = document.createElement("p");
    this.indicator = document.createElement("div");
    this.colorInput = document.createElement("input");

    this.container.setAttribute("class", "color-picker");
    this.text.setAttribute("class", "color-text");
    this.indicator.setAttribute("class", "color-indicator");
    this.colorInput.setAttribute("type", "color");

    this.text.innerText = "#fff";
    this.indicator.style.backgroundColor = "#fff";

    this.container.appendChild(this.text);
    this.container.appendChild(this.indicator);
    this.container.appendChild(this.colorInput);

    this.shadowRoot.append(this.style, this.container);
  }

  connectedCallback() {
    // this.onChange = this.getAttribute("onChange");
    this.color = this.getAttribute("color");
    this.text.innerText = this.color;
    this.indicator.style.backgroundColor = this.color;
    this.targetElements = this.getAttribute("target-elements")
      ?.replaceAll("[", "")
      ?.replaceAll("]", "")
      ?.split(",");

    this.targetProps = this.getAttribute("target-props")
      ?.replaceAll("[", "")
      ?.replaceAll("]", "")
      ?.split(",");

    if (this.isConnected) {
      this.colorInput.addEventListener("input", (event) => {
        this.setText = event.target.value;
        this.setIndicatorColor = event.target.value;
        this.color = event.target.value;
        console.log(event);
        this.targetElements?.forEach((e, ind) => {
          console.log(
            document.querySelector(e),
            this.colorInput.value,
            this.targetProps,
            ind
          );
          document.querySelector(e).style[this.targetProps[ind]] =
            this.colorInput.value;
        });
        if (this.onChange) {
          try {
            this.onChange();
          } catch (e) {
            console.log(this.onChange);
            console.log(e);
          }
        }
      });

      this.colorInput.addEventListener("change", (event) => {
        this.setText = event.target.value;
        this.setIndicatorColor = event.target.value;
        this.color = event.target.value;
        console.log(event);
        this.targetElements?.forEach((e, ind) => {
          console.log(
            document.querySelector(e),
            this.colorInput.value,
            this.targetProps,
            ind
          );
          document.querySelector(e).style[this.targetProps[ind]] =
            this.colorInput.value;
        });
        if (this.onChange) {
          try {
            this.onChange();
          } catch (e) {
            console.log(this.onChange);
            console.log(e);
          }
        }
      });
    }
  }

  get style() {
    let style = document.createElement("style");
    style.textContent = `
      .color-picker{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0.5rem;
          border-radius:15px;
          background-color:#303030;
          box-sizing: border-box;
          background: #585858;
      }
  
      .color-text{
        font-weight: 400;
        font-size: 1.15rem;
        margin: 0;
      }
  
      .color-indicator{
          height:25px;
          aspect-ratio:1/1;
          border-radius:35%;
      }
  
      input[type="color"]{
          position:absolute;
          opacity:0;
          z-index:-1;
      }
      
      `;

    return style;
  }

  /**
   *@param {string} value 

  */
  set setColor(value) {
    this.setText = value;
    this.setIndicatorColor = value;
    this.color = value;
    this.colorInput.value = value;
  }
  /**
   * @param {string} value
   */
  set setText(value) {
    this.text.innerText = value;
  }

  /**
   * @param {string} color
   */
  set setIndicatorColor(color) {
    this.indicator.style.backgroundColor = color;
  }
}

customElements.define("color-picker", ColorPicker);
customElements.define("gradient-picker", GradientPicker);
