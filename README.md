# PROBA v4.0 — Aventura de conocimiento

PROBA es una PWA de preguntas de opción múltiple para estudiar mediante campañas y sesiones de práctica. Funciona en el navegador, conserva la biblioteca y el progreso localmente y puede instalarse como aplicación.

## Publicar en GitHub Pages

1. Descomprime el ZIP y sube **el contenido completo** a la raíz del repositorio (no subas el ZIP dentro del repositorio).
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`.
4. Abre la URL de GitHub Pages cuando termine el despliegue.

La aplicación utiliza rutas relativas y puede funcionar tanto en un dominio de proyecto como en un dominio propio. Abre la página al menos una vez con conexión para que el navegador instale el Service Worker y guarde los archivos principales para uso sin conexión.

## Biblioteca e importación

En **Inicio** crea materias y agrega documentos con bancos de preguntas. Puedes revisar, editar o eliminar preguntas y documentos. En **Aventura** selecciona las fuentes activas; la selección se conserva para futuras partidas.

Formatos de importación:

- `.txt` y `.md`: utiliza `plantilla-preguntas-proba.txt`.
- `.csv`: encabezados `Pregunta,A,B,C,D,Respuesta,Explicación`.
- `.docx`: preguntas en párrafos con el formato de la plantilla.
- `.xlsx`: primera hoja con las columnas `Pregunta`, `A`, `B`, `C`, `D`, `Respuesta` y, opcionalmente, `Explicación`.
- `.pdf`: debe contener texto seleccionable. El lector PDF se carga desde un CDN la primera vez, por lo que la primera importación requiere conexión. No hay OCR integrado para PDF escaneados.

Cada pregunta necesita un enunciado, opciones y una respuesta correcta (`Respuesta: B`, por ejemplo). La explicación es opcional. Después de importar, revisa el documento y confirma que el número de preguntas detectadas sea correcto.

## Modos de juego

### Campaña

- Una campaña estándar tiene 30 posiciones: Nivel I (5 preguntas), Nivel II (10) y Nivel III (15).
- Los puntos de control aparecen cada 5 posiciones. Para clases distintas del Berserker, el oro acumulado se asegura en esos puntos.
- Se inicia con 1.000 de oro. Una pregunta correcta concede 1.000 de oro la primera vez que se domina en una campaña, aplicando el multiplicador de la clase cuando corresponde.
- Las preguntas se deduplican entre documentos. La misma pregunta no vuelve a pagar oro después de haberse dominado, aunque se importe en otro banco o aparezca de nuevo.
- Los bonos de nivel son 5.000, 10.000 y 15.000. Cada uno requiere dominar por primera vez al menos el 60 % de las preguntas de ese nivel. El multiplicador del Berserker se aplica a las recompensas por pregunta nueva, no a estos bonos. La Transmutación ×4 del Mago sí multiplica los bonos futuros. La bonificación por victoria es de 10.000 para las clases normales y 50.000 para el Berserker; exige dominar por primera vez al menos el 60 % de la campaña. La Transmutación del Mago también multiplica su bono futuro de victoria.
- Retirarse termina la campaña, pero no aplica una penalización de cartera para clases normales. La regla especial del Berserker depende de su Nivel IV.
- **No hay límite de tiempo para jugar.** El cronómetro solo comprueba si llegas a completar las primeras 15 posiciones en menos de 150 segundos. Si lo consigues, se activa Frenesí; si no, la campaña continúa normalmente.
- Frenesí dura 90 segundos y ofrece 5 usos de cada comodín (50/50, Hint y Reintentar). No es necesario activarlo para completar la campaña.
- Las respuestas se confirman en dos pulsaciones: la primera selecciona y la segunda confirma la misma opción.

### Modo Estudio

- Permite practicar 5, 10, 15, 30 o todas las preguntas disponibles.
- No tiene límite de tiempo, penalizaciones, habilidades de clase ni recompensas de oro.
- Una respuesta correcta registra la pregunta como dominada. Ese registro es global, así que esa pregunta no podrá generar oro posteriormente en una campaña.
- Los errores se guardan para repasarlos después.

## Clases y árboles de habilidades

Solo se puede escoger **una clase activa por campaña**. Los efectos de clases distintas nunca se combinan. Cada árbol tiene cinco niveles: una habilidad inicial y cuatro mejoras/sacrificios progresivos. Los sacrificios desbloqueados permanecen activos en las campañas de esa clase.

### Ninja — velocidad y precisión

| Nivel | Efecto |
|---|---|
| I · Instinto de sombra | Cada 3 respuestas correctas consecutivas, obtiene 2 cargas de salto. Al inicio los saltos se usan automáticamente. |
| II · Desapego (sacrificio) | Comienza sin el comodín Reintentar. |
| III · Control del impulso | Decide cuándo usar los saltos y aumenta la reserva máxima a 4 cargas. |
| IV · Impulso costoso (sacrificio) | Cada pregunta saltada cuesta 2 cargas en vez de una. Se necesitan al menos 2 cargas para saltar. |
| V · Almacén de sombras | Aumenta la reserva máxima a 6 cargas. |

Saltar una pregunta no cuenta como acierto, no marca conocimiento nuevo y no concede oro.

### Ladrón — manipulación de alternativas

| Nivel | Efecto |
|---|---|
| I · Robo de respuestas | Elimina automáticamente una alternativa incorrecta en cada pregunta. |
| II · Codicia (sacrificio) | Comienza sin el comodín Reintentar. |
| III · Hurto preciso | En las preguntas 5, 10, 15, 20, 25 y 30 elimina una segunda alternativa incorrecta. |
| IV · Apuesta peligrosa (sacrificio) | No puede usar el comodín 50/50, tampoco durante Frenesí. |
| V · Maestro del engaño | Elimina automáticamente dos alternativas incorrectas en cada pregunta. |

La habilidad nunca elimina la respuesta correcta ni deja menos de dos alternativas visibles. Los efectos automáticos del Ladrón y el comodín 50/50 están limitados para no revelar la respuesta por descarte.

### Mago — azar y alteración de la campaña

| Nivel | Efecto |
|---|---|
| I · Dados del destino | Al llegar a la pregunta 10, lanza un dado con seis resultados posibles. |
| II · Pacto arcano (sacrificio) | Comienza sin el comodín Reintentar. |
| III · Manipulación del destino | Una vez por campaña, puede posponer el lanzamiento desde la pregunta 10 hasta la 15. |
| IV · Deuda mágica (sacrificio) | Su campaña base tiene 35 preguntas en vez de 30. Necesita 35 preguntas distintas disponibles en las fuentes activas. |
| V · Doble destino | Lanza dos dados y elige cuál de los dos resultados aplicar. |

Resultados del dado:

1. **Transmutación ×4:** multiplica por cuatro las futuras ganancias de oro de esa campaña, incluidos los bonos posteriores.
2. **Salto dimensional:** salta las siguientes 10 posiciones; no las responde ni obtiene oro por ellas.
3. **Caos alternado:** salta una de cada dos preguntas restantes.
4. **Retorno al origen:** vuelve a la pregunta 1 conservando el oro acumulado. Las preguntas ya dominadas no vuelven a pagar y los bonos de nivel ya procesados no se repiten.
5. **Deuda del destino:** añade 5 preguntas. Primero utiliza preguntas distintas todavía no incorporadas al juego; si no quedan suficientes, repite preguntas ya vistas. Las repeticiones no generan oro de nuevo.
6. **Robo arcano:** recibe 2 usos adicionales de comodines aleatorios.

El dado se resuelve una sola vez por campaña. El multiplicador ×4 no se acumula consigo mismo. El efecto de retorno conserva el progreso y evita repetir bonificaciones ya cobradas.

### Berserker — riesgo y recompensa

| Nivel | Efecto |
|---|---|
| I · Furia | Multiplica por 2 el oro de las preguntas nuevas dominadas. |
| II · Descontrol (sacrificio) | Comienza sin el comodín Reintentar. |
| III · Sed de sangre | El multiplicador de oro aumenta a ×3. |
| IV · Sin retirada (sacrificio) | Si se retira voluntariamente, pierde todo el oro acumulado en esa campaña. |
| V · Furia absoluta | El multiplicador aumenta a ×4. La bonificación por victoria es de 50.000. |

El Berserker necesita tener oro general superior a cero para iniciar una campaña. Si falla, pierde todo el oro de esa campaña, incluido lo que otras clases habrían asegurado en puntos de control, y además paga una penalización del 10 % de su cartera general. Si se retira antes de desbloquear el Nivel IV, conserva el oro de campaña; después de desbloquearlo, la retirada también destruye ese oro. La retirada no añade el 10 % de penalización: ese cargo corresponde al fallo.

## Oro, dominio y prevención de recompensas repetidas

- El oro es compartido entre todas las clases y comienza en 1.000.
- Solo las campañas conceden oro. El Modo Estudio no entrega monedas.
- El dominio de una pregunta se registra globalmente y una pregunta paga como máximo una vez, sin importar la materia o documento donde aparezca.
- Los bonos de nivel y victoria requieren el umbral del 60 % de preguntas nuevas y no se pueden repetir regresando al inicio con el Mago.
- Los puntos de control aseguran el oro de campaña de las clases normales cada 5 posiciones. El Berserker nunca asegura oro durante la campaña.
- `Restablecer oro y personaje` devuelve la cartera a 1.000, bloquea las mejoras y limpia el historial, pero conserva materias, documentos y preguntas dominadas para impedir volver a farmear el mismo contenido.

## Datos y privacidad

La biblioteca, el oro, las habilidades, las preguntas dominadas y el historial se guardan en IndexedDB, con alternativa a localStorage. No se requiere cuenta ni servidor y los datos no se sincronizan en la nube. En **Configuración** puedes exportar una copia JSON y restaurarla en otro navegador o dispositivo. Borrar los datos del navegador sin respaldo puede eliminar el progreso.

## Migración desde v3.3

Al abrir v4.0 con los datos locales de v3.3, PROBA conserva la biblioteca, documentos, selección de fuentes, oro, historial y registro de preguntas dominadas. El número de mejoras que ya tenía cada clase se traslada al mismo número de niveles desbloqueados del nuevo árbol de cinco niveles. Haz una copia de seguridad antes de actualizar, especialmente si tienes progreso valioso.

## Archivos principales

- `index.html`: estructura de las pantallas.
- `styles.css`: diseño adaptable.
- `app.js`: lógica, importación, economía, clases y campañas.
- `sw.js`: caché de la aplicación para uso sin conexión.
- `manifest.json` e `icon.svg`: instalación e identidad de la PWA.
- `plantilla-preguntas-proba.txt`: plantilla de importación.
