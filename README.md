# PROBA — Aventura de conocimiento

PWA de estudio gamificado, diseñada para funcionar en GitHub Pages y guardar la biblioteca, las preguntas, el oro y el progreso localmente en el dispositivo.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `proba`.
2. Sube **todos los archivos de esta carpeta** a la raíz del repositorio (no subas la carpeta comprimida dentro del repositorio).
3. En el repositorio entra a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**, elige `main` y la carpeta `/ (root)`, y guarda.
5. Cuando GitHub termine el despliegue, abre la dirección que te muestre Pages. En un repositorio llamado `proba` normalmente será `https://TU-USUARIO.github.io/proba/`.

La aplicación usa rutas relativas, por lo que funciona tanto en un dominio propio como en una página de proyecto de GitHub Pages. Se recomienda abrirla una vez con conexión para que el navegador instale el Service Worker y guarde la aplicación para uso sin conexión.

## Importar preguntas

En **Inicio**, crea una materia y luego importa uno o varios documentos. Puedes organizar, revisar, editar y eliminar bancos dentro de cada materia.

Formatos disponibles:

- `.txt` y `.md`: formato de pregunta mostrado en `plantilla-preguntas-proba.txt`.
- `.csv`: primera fila con encabezados `Pregunta,A,B,C,D,Respuesta,Explicación`.
- `.docx`: preguntas escritas en párrafos con el mismo formato de la plantilla.
- `.xlsx`: la primera hoja debe tener encabezados `Pregunta`, `A`, `B`, `C`, `D`, `Respuesta` y, opcionalmente, `Explicación`.
- `.pdf`: debe tener texto seleccionable. El lector PDF se carga desde un CDN la primera vez que se importa un PDF; por eso la primera importación de PDF requiere conexión. Los PDF escaneados no tienen OCR integrado.

Cada pregunta debe incluir opciones y una respuesta correcta (`Respuesta: B`, por ejemplo). La explicación es opcional. En archivos de texto se reconocen los encabezados numerados `Pregunta 1:`, `Pregunta 2:`, etc., aunque el extractor del documento no conserve líneas en blanco entre preguntas. También se admiten bloques separados por líneas en blanco y etiquetas como `Respuesta correcta: B`. Después de importar, revisa el contador de preguntas del documento antes de iniciar una campaña.

## Reglas iniciales del juego

### Campaña

- Tres niveles: 5, 10 y 15 preguntas (30 en total).
- Cada múltiplo de cinco es un punto de control.
- Oro inicial: 1.000.
- Recompensa por respuesta correcta: 1.000 de oro.
- Bonos por completar cada nivel: 5.000, 10.000 y 15.000 de oro.
- Retirarse conserva todo el oro ganado durante la campaña.
- Si una clase normal falla, conserva lo asegurado en puntos de control y pierde lo ganado desde el último punto de control.
- Completar la campaña concede una bonificación general de 10.000.
- Si se completan los niveles I y II en menos de cinco minutos, se activa Frenesí: comodines ilimitados durante 90 segundos en el nivel III.
- Las respuestas se confirman con dos pulsaciones: una para seleccionar y otra sobre la misma opción para confirmar.

### Clases

- **Ninja:** cada tres respuestas correctas permite saltar las dos preguntas siguientes. Las preguntas saltadas cuentan para avanzar por la campaña, pero no dan oro por respuesta.
- **Ladrón:** elimina una alternativa incorrecta en cada pregunta.
- **Mago:** convierte automáticamente el primer error de la campaña en un acierto y revela la respuesta correcta.
- **Berserker:** gana el doble por cada acierto. Necesita tener oro general mayor que cero para entrar. Si pierde, pierde todo el oro de esa campaña —incluido lo que habría quedado asegurado— y además pierde el 10 % de su oro general. Si se retira o gana, conserva el oro de campaña; completar la campaña concede una bonificación especial de 50.000, mayor que la bonificación de las otras clases.

Cada clase tiene su propio árbol de cinco rangos (nivel inicial y cuatro nodos). Los niveles fantasma no conceden una mejora directa, pero deben comprarse para desbloquear la siguiente habilidad. El oro es compartido entre todas las clases.

### Modo Estudio

Práctica sin temporizador, penalizaciones ni recompensas de oro. Se muestra una sola pregunta a la vez. Después de acertar o revisar un error, se utiliza el botón `Siguiente pregunta` para avanzar. Al responder mal, muestra la respuesta correcta y la explicación si fue importada; los errores quedan guardados para repasarlos desde el resultado y el Registro.

## Almacenamiento y respaldo

- La biblioteca y el progreso se guardan en IndexedDB (con alternativa a localStorage).
- Los datos no se sincronizan con una cuenta ni se suben a un servidor.
- Desde el engranaje de **Configuración** puedes exportar una copia JSON o restaurarla en otro dispositivo.
- Borrar los datos del navegador sin una copia puede eliminar el progreso.

## Personalización inicial

Los valores iniciales de recompensa, precios, mejoras de clase y duración de Frenesí se encuentran al inicio de `app.js`, en `DEFAULT_STATE`, `SKILLS` y `LEVELS`.

## Correcciones de la versión 2

- La lectura de preguntas numeradas ya no depende de líneas en blanco; esto evita fusionar preguntas al extraer texto de PDF/DOCX.
- Se añadió avance explícito con el botón `Siguiente pregunta` en Estudio y tras acertar en Campaña.
- Se añadió un bloqueo de respuesta para evitar que una misma pregunta se contabilice dos veces.
- El saldo inicial es de 1.000 de oro. Los perfiles de la versión anterior que tenían el saldo inicial de 0 reciben el saldo inicial durante la migración.
- La interfaz limita el desbordamiento horizontal y adapta la vista de partida a pantallas estrechas y de poca altura.
- Se renovó la caché del Service Worker para que GitHub Pages descargue los archivos corregidos.
