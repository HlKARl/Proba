# PROBA 0.1 · Primera versión funcional

PROBA es una PWA local para organizar materias, importar bancos de preguntas y practicar en sesiones de hasta 15 preguntas. La interfaz y la estructura son independientes de LOGOS; del proyecto anterior se tomó como referencia únicamente la arquitectura ligera de HTML/CSS/JavaScript y el patrón de instalación offline.

## Qué incluye esta versión

- Biblioteca para crear, renombrar y eliminar materias.
- Documentos independientes dentro de cada materia.
- Importación de `.docx`, `.pdf`, `.xlsx` y `.txt`.
- Revisión de las preguntas reconocidas antes de guardar el documento.
- Edición de enunciado, cuatro opciones, respuesta correcta y explicación.
- Selección de uno o varios documentos antes de iniciar una partida.
- Configuración universal: Concurso/Estudio, 5–15 preguntas y orden aleatorio, por documento o solo preguntas falladas.
- Partidas de selección múltiple con puntuación, corrección inmediata y resultados.
- Registro local de intentos y progreso por materia.
- IndexedDB para guardar documentos, preguntas, materias y sesiones en el dispositivo.
- PWA con caché offline para la aplicación.

## Estructura de preguntas compatible

Para que el importador identifique con precisión cada pregunta, se recomienda este formato en Word, PDF o TXT:

```text
1. ¿Qué es un sensor?
A) Un dispositivo que mide una variable física.
B) Un dispositivo que genera energía.
C) Un elemento de protección.
D) Un actuador eléctrico.
Respuesta correcta: A
Explicación: Un sensor detecta una magnitud física y la convierte en una señal.

2. ¿Qué es un actuador?
A) Un elemento de medición.
B) Un dispositivo que transforma una señal en una acción.
C) Un tipo de sensor.
D) Un circuito de protección.
Respuesta correcta: B
```

También puede descargarse `PLANTILLA_PROBA.txt` para usarla como punto de partida.

### Excel (.xlsx)

La primera fila debe contener encabezados. Usa estas columnas en este orden o con nombres equivalentes:

`Pregunta | A | B | C | D | Respuesta correcta | Explicación`

La columna de respuesta debe contener `A`, `B`, `C` o `D` (también se aceptan `1` a `4`). El importador lee la primera hoja del libro.

### Notas de importación

- Se admiten `.docx`, `.pdf`, `.xlsx` y `.txt`. Los formatos antiguos `.doc` y `.xls` no están incluidos.
- Cada pregunta debe tener cuatro opciones y una respuesta correcta identificable.
- Los PDF escaneados como imagen no se reconocen en esta versión; necesitan texto seleccionable. PROBA no hace OCR.
- El lector PDF.js se carga desde jsDelivr la primera vez que se importa un PDF. Una vez descargado, el Service Worker puede conservarlo para futuras importaciones sin conexión en ese navegador.
- La importación y el análisis de los documentos se realizan en el navegador. No se envían a un servidor de PROBA.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `PROBA`.
2. Descomprime el ZIP y sube **el contenido de esta carpeta** a la raíz del repositorio.
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, selecciona `Deploy from a branch`, la rama `main` y la carpeta `/ (root)`.
5. Guarda y abre la URL que GitHub Pages indique.
6. Visita PROBA una vez con internet para que se instale el Service Worker; luego puedes instalarla desde el navegador y volver a abrirla sin conexión.

No abras `index.html` directamente con `file://`: las funciones PWA y el almacenamiento deben probarse desde HTTPS (GitHub Pages) o desde un servidor local.

## Datos y límites de esta versión

- Los datos se guardan en el almacenamiento local del navegador/dispositivo. No hay cuenta ni sincronización automática entre PC y teléfono.
- No borres los datos del sitio del navegador: eso puede eliminar la biblioteca local.
- Esta versión todavía no incluye exportación/restauración de copias de seguridad, música, temporizadores, comodines, ni preguntas abiertas/verdadero-falso.
- El modo Concurso y el modo Estudio comparten el motor de selección múltiple; Estudio muestra la explicación cuando existe en el documento.
- El importe máximo de preguntas por partida es 15, aunque el documento contenga más.

## Archivos

- `index.html`: estructura de la interfaz.
- `styles.css`: identidad visual y diseño adaptable.
- `app.js`: biblioteca, configuración, partidas y estadísticas.
- `db.js`: almacenamiento IndexedDB.
- `importers.js`: lectura de documentos y extracción de preguntas.
- `sw.js`: caché PWA/offline.
- `manifest.webmanifest`: configuración instalable.
