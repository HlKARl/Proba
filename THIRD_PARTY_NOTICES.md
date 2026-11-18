# Avisos de terceros

PROBA 0.1 no empaqueta código de terceros para la biblioteca, el motor de preguntas ni la interfaz.

La importación de PDF carga de forma dinámica **PDF.js** (`pdfjs-dist`) versión `6.5.438` desde jsDelivr. PDF.js es un proyecto de Mozilla distribuido bajo licencia Apache 2.0. La licencia y el código fuente están disponibles en:

- https://github.com/mozilla/pdf.js
- https://www.apache.org/licenses/LICENSE-2.0

El navegador conserva localmente los recursos del lector PDF después de su primera descarga cuando el almacenamiento de caché está disponible.
