let fileType = "<%= it.fileType %>";
// let bg = "";
let e;
let str = <%= it.selectedText %>;
let padding = {
  left: 32,
  right: 32,
  top: 32,
  bottom: 32,
};
let solidColors = [
  "red",
  "crimson",
  "blue",
  "green",
  "cyan",
  "wheat",
  "whitesmoke",
  "white",
  "gray",
  "darkgray",
  "black",
  "pink",
  "orange",
  "yellow",
  "purple",
];

let linearGradients = [
  "linear-gradient(337deg, rgb(101, 78, 163), rgb(218, 152, 180))",
  "linear-gradient(354deg, rgb(255, 117, 181), rgb(255, 184, 108))",
  "linear-gradient(355deg, rgb(28, 94, 101), rgb(83, 197, 148))",
  "linear-gradient(55deg, rgb(138, 35, 135), rgb(233, 64, 87), rgb(233, 64, 87))",
  "linear-gradient(270deg, rgb(20, 30, 48), rgb(36, 59, 85))",
  "linear-gradient(120deg, rgb(212, 252, 121), rgb(150, 230, 161))",
  "linear-gradient(120deg, rgb(246, 211, 101), rgb(253, 160, 133))",
  "linear-gradient(120deg, rgb(132, 250, 176), rgb(143, 211, 244))",
  "linear-gradient(120deg, rgb(252, 203, 144), rgb(213, 126, 235))",
  "linear-gradient(145deg, rgb(48, 207, 208), rgb(51, 8, 103))",
];



let vscode = acquireVsCodeApi();
let svg = document.querySelector("svg");
let pre = document.querySelector("pre");
let select = document.querySelector("select");
let codeElement = document.querySelector("code");
let bgUpload = document.querySelector(".bg_upload");
let creatorName = document.querySelector(".creatorName");
let foreignCode = document.querySelector(".foreignCode");
let foreignTitle = document.querySelector(".foreignTitle");
let paddingElements = document.querySelectorAll(".padding");
let style_element = document.querySelector("#style_element");
let downloadButton = document.querySelector(".download_button");
let textOptionsContainer = document.querySelector(".text_options");
let colorOptionsContainer = document.querySelector(".color_options");
let linksContainer = colorOptionsContainer.querySelector(".links_container");
let textlinksContainer = textOptionsContainer.querySelector(".links_container");
let contentContainer =
  colorOptionsContainer.querySelector(".content_container");
let textOptionsContentContainer =
  textOptionsContainer.querySelector(".content_container");

let textCheckbox = textOptionsContainer
  .querySelector(".options")
  .querySelector("input[type='checkbox']");
let resizeobserver = new ResizeObserver((e) =>
  e.forEach((entry) => {
    entry.target == pre
      ? setBoundingProps(entry.contentRect.height, entry.contentRect.width)
      : null;
  })
);
downloadButton.addEventListener("click", makeImage);


// window.addEventListener("pointerdown",(event) => {
//   e = document.createElement("div");
//   e.style.position = "absolute";
//   e.style.height="50px";
//   e.style.width="50px";
//   e.style.zIndex="10000";
//   e.style.backgroundColor="red";
//   e.style.transform=`translate(${event.x}px,${event.y}px)`;
  
//   document.body.appendChild(e);
// });

// window.addEventListener("pointermove",(event) => {
//   e.style.transform = `translate(${event.x}px,${event.y}px)`;
// })
// window.addEventListener("pointerup",(event) => {
//   document.body.removeChild(e);
// })

window.addEventListener("load", () => {
  resizeobserver.observe(pre);
  codeElement.innerHTML = str;
  hljs.highlightAll();
  hljs.initLineNumbersOnLoad();
  createSolidColorElements();
  createGradientColorElements();
});

select.addEventListener("change", (event) =>
  vscode.postMessage({
    type: "change_style",
    style: event.target.value,
  })
);

bgUpload.addEventListener("change", (event) => getBase64(bgUpload.files[0]));

linksContainer.querySelectorAll("li").forEach((li) => {
  li.addEventListener("click", (e) => {
    contentContainer
      .querySelectorAll("div")
      .forEach((div) =>
        div.classList.contains(e.target.getAttribute("data-tab"))
          ? div.classList.add("active")
          : div.classList.remove("active")
      );
    linksContainer
      .querySelectorAll("li")
      .forEach((li) =>
        li == e.target
          ? li.classList.add("active")
          : li.classList.remove("active")
      );
  });
});

textlinksContainer.querySelectorAll("li").forEach((li) => {
  li.addEventListener("click", (e) => {
    textOptionsContentContainer.querySelectorAll("div").forEach((div) => {
      div.classList.contains(e.target.getAttribute("data-tab"))
        ? div.classList.add("active")
        : div.classList.remove("active");
    });
    textlinksContainer.querySelectorAll("li").forEach((li) => {
      li == e.target
        ? li.classList.add("active")
        : li.classList.remove("active");
    });
  });
});

textCheckbox.addEventListener("change", (event) => {
  event.target.checked
    ? (creatorName.querySelector("p").style.display = "block")
    : (creatorName.querySelector("p").style.display = "none");
});

paddingElements.forEach((elem) => {
  elem.querySelector("p").addEventListener("input", (event) => {
    let className = elem.getAttribute("class").split(" ")[1];
    padding[className] = Number(event.target.innerText);
    setBoundingProps(
      pre.getBoundingClientRect().height,
      pre.getBoundingClientRect().width
    );
    if (className == "bottom") {
      creatorName.setAttribute("height", padding["bottom"] - 10);
    }
  });
});

window.addEventListener("message", (event) => {
  let message = event.data;
  switch (message.type) {
    case "new_style":
      svg.querySelector("style")
        ? svg.removeChild(svg.querySelector("style"))
        : null;
      style_element.innerHTML = message.style;
      break;
  }
});

async function makeImage() {
  let canvas = document.querySelector("canvas");

  const style = createStyleElementFromCSS();
  svg.insertBefore(style, svg.firstChild);

  let xml = new XMLSerializer().serializeToString(svg);
  let svg64 = btoa(xml);
  let b64start = "data:image/svg+xml;base64,";

  let img64 = b64start + svg64;
  let img = new Image();

  let bgImg = new Image();
  bgImg.src = bg;
  canvas.height = svg.clientHeight * 3;
  canvas.width = svg.clientWidth * 3;

  let ratio = canvas.width / canvas.height;
  img.onload = function () {
    let ctx = canvas.getContext("2d");
    ctx.drawImage(
      bgImg,
      0,
      0,
      bgImg.width,
      bgImg.height,
      0,
      0,
      canvas.height * ratio,
      canvas.height
    );
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      canvas.height * ratio,
      canvas.height
    );

    downloadImg();
  };

  img.src = img64;
}

const createStyleElementFromCSS = () => {
  let elemObj = {
    name: "style",
    type: "text/css",
  };

  const style = createElement(elemObj);
  const sheet = [...document.styleSheets];

  sheet.forEach((s) => {
    const styleRules = [];
    for (let i = 0; i < s.cssRules.length; i++)
      styleRules.push(s.cssRules.item(i).cssText);
    style.appendChild(document.createTextNode(styleRules.join(" ")));
  });
  return style;
};

function downloadImg() {
  let canvas = document.querySelector(" canvas");
  let data = canvas.toDataURL();

  let elemObj = {
    name: "a",
    href: data,
    attributes: {
      download: "snipit.jpg",
    },
  };

  let elem = createElement(elemObj);
  elem.href = data;
  elem.setAttribute("download", "snipit.jpg");
  elem.click();
}
function getBase64(file) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    bg = reader.result;
    svg.style.backgroundImage = "url(" + bg + ")";
    svg.style.backgroundPosition = "center";
    svg.style.backgroundSize = "cover";
  };
}
function createSolidColorElements() {
  let solidColorsElement = document
    .querySelector(".solid_colors")
    .querySelector(".common_colors");
  solidColors.forEach((color) => {
    let elemObj = {
      name: "div",
      attributes: {
        class: "solid_color",
      },
      styles: {
        backgroundColor: color,
      },
      eventListeners: {
        click: () => (svg.style.background = color),
      },
    };

    let elem = createElement(elemObj);
    solidColorsElement.appendChild(elem);
  });
}

function createGradientColorElements() {
  let gradientColorsElement = document
    .querySelector(".gradient_colors")
    .querySelector(".common_gradients");
  linearGradients.forEach((color) => {
    let elemObj = {
      name: "div",
      attributes: {
        class: "gradient_color",
      },
      styles: {
        backgroundImage: color,
      },
      eventListeners: {
        click: () => (svg.style.backgroundImage = color),
      },
    };
    let elem = createElement(elemObj);
    gradientColorsElement.appendChild(elem);
  });
}

function setBoundingProps(height, width) {
  foreignCode.setAttribute("height", height);
  foreignCode.setAttribute("width", width);

  foreignTitle.setAttribute("width", width);

  creatorName.setAttribute("y", height + 35);
  creatorName.setAttribute("width", width);

  svg.setAttribute("height", height + 35 + padding.top + padding.bottom);
  svg.setAttribute("width", width + padding.left + padding.right);
  svg.setAttribute(
    "viewBox",
    `-${padding.left} -${padding.top} ` +
      (width + padding.left + padding.right) +
      " " +
      (height + padding.top + padding.bottom + 35)
  );
}

function createElement(options) {
  let elem = document.createElement(options.name);
  for (let option in options.attributes) {
    elem.setAttribute(option, options.attributes[option]);
  }

  for (let option in options.styles) {
    elem.style[option] = options.styles[option];
  }

  for (let option in options.eventListeners) {
    elem.addEventListener(option, options.eventListeners[option]);
  }

  options.type ? (elem.type = options.type) : null;
  options.href ? (elem.href = options.href) : null;
  return elem;
}
