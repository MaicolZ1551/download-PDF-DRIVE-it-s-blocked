let trustedURL;

if (window.trustedTypes && trustedTypes.createPolicy) {
    const policy = trustedTypes.createPolicy('myPolicy', {
        createScriptURL: (input) => {
            return input;
        }
    });
    trustedURL = policy.createScriptURL('https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js');
} else {
    trustedURL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js';
}

// Load the jsPDF library
let jspdf = document.createElement("script");
jspdf.onload = function() {

    let pdf = null;
    let pageWidth_mm;
    let pageHeight_mm;
    let isFirstPage = true;

    let elements = document.getElementsByTagName("img");

    for (let i = 0; i < elements.length; i++) {
        let img = elements[i];

        if (!/^blob:/.test(img.src)) {
            continue;
        }

        // === DIMENSIONES ORIGINALES DE LA IMAGEN ===
        let imgW_px = img.naturalWidth  || img.width;
        let imgH_px = img.naturalHeight || img.height;

        // Convertimos píxeles a milímetros usando 72 DPI
        // (este es el estándar que mantiene el "tamaño original" sin distorsión)
        const dpi = 72;
        const mmPerInch = 25.4;
        let thisPageW = (imgW_px / dpi) * mmPerInch;
        let thisPageH = (imgH_px / dpi) * mmPerInch;

        // Primera página → creamos el PDF con el tamaño exacto de la imagen
        if (isFirstPage) {
            let orientation = (thisPageW > thisPageH) ? 'l' : 'p';
            pdf = new jsPDF(orientation, 'mm', [thisPageW, thisPageH]);

            pageWidth_mm  = thisPageW;
            pageHeight_mm = thisPageH;
            isFirstPage = false;
        } 
        // Siguientes páginas → reutilizamos el mismo tamaño (addPage sin parámetros es seguro en v1.3.2)
        else {
            pdf.addPage();
        }

        // Creamos el canvas con la resolución real de la imagen
        let canvasElement = document.createElement('canvas');
        let con = canvasElement.getContext("2d");

        canvasElement.width  = imgW_px;
        canvasElement.height = imgH_px;

        con.drawImage(img, 0, 0, imgW_px, imgH_px);

        let imgData = canvasElement.toDataURL("image/jpeg", 1.0);

        // Añadimos la imagen ocupando EL 100% de la página (sin bordes y sin estirar)
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth_mm, pageHeight_mm);
    }

    if (pdf) {
        pdf.save("download.pdf");
    }
};

jspdf.src = trustedURL;
document.body.appendChild(jspdf);