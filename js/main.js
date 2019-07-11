const url = "doc/sample.pdf";

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;


const scale = 1.5,
  canvas = document.querySelector("#pdf-render"),
  ctx = canvas.getContext('2d');

//Render Page
const renderPage = num => {
  pageIsRendering = true;

  //Get page
  pdfDoc.getPage(num).then(page => {

    //Set Scale

    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;
      if (pageNumIsPending != null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });
    //Output current page
    document.querySelector('#page-number').textContent = num;
  });
};

//Check Page rendering

const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  }
  else {
    renderPage(num);
  }
}

//Previous Page

const prevPage = () => {
  if (pageNum <= 1) {
    return
  }
  else {
    pageNum--;
    queueRenderPage(pageNum)
  }
}

//Next Page
const nextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return
  }
  else {
    pageNum++;
    queueRenderPage(pageNum)
  }
}


//Get Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  document.querySelector("#page-count").textContent = " " + pdfDoc.numPages

  renderPage(pageNum)
})
  .catch(err => {
    const div = document.createElement('div');
    div.className = 'error'
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    //removes topbar
    document.querySelector('.top-bar').style.display = 'none';
  });

//Button Event

document.querySelector('#previous-page').addEventListener('click', prevPage);
document.querySelector('#next-page').addEventListener('click', nextPage);
