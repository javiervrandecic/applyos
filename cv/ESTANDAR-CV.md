# Estándar de CV

Reglas para el CV maestro y para cada versión adaptada a un aviso. Salieron de rechazos reales y de revisar PDFs que se veían bien y estaban rotos.

---

## El principio que ordena todo

**El tailoring es de énfasis y de orden, nunca de invención.**

Adaptar un CV significa mover hacia arriba lo que este aviso valora, usar sus palabras para nombrar lo que ya hiciste, y bajar lo que acá no aporta. No significa agregar tecnologías que no manejas ni inflar niveles.

La honestidad calibrada no es un costo, es el diferenciador. Un nivel declarado de más se cae en la primera entrevista técnica y se lleva puesta toda tu credibilidad, incluido lo que sí era cierto.

---

## Un maestro, muchas versiones

Mantén **un CV maestro por idioma** con todo tu material. De ahí sale cada versión adaptada.

- Nunca generes un CV adaptado a partir de otro CV adaptado. Se arrastran recortes viejos y datos desactualizados.
- Educación y certificaciones se copian **siempre del maestro**, nunca de una versión anterior.
- El maestro puede tener 4 páginas. La versión que envías, no.

---

## Formato ATS

Los filtros automáticos leen mal cualquier cosa que no sea texto lineal.

- **Sin tablas de varias columnas** en la sección de habilidades. Una columna, en lista.
- **La palabra "Skills" o "Habilidades" tiene que estar en el título de la sección.** Los parsers la buscan literal.
- Sin texto dentro de imágenes, sin iconos que reemplacen palabras, sin cajas de texto flotantes.
- Fuentes estándar. Nada exótico que el parser convierta en símbolos.
- Fechas en formato consistente en todo el documento.

## Usa las palabras del aviso

Si el aviso dice "workflow automation" y tu CV dice "automatización de flujos", el filtro no los une. Toma las frases exactas del aviso para nombrar lo que ya hiciste, siempre que sea verdad.

Esto no es rellenar de palabras clave. Es traducir tu experiencia al vocabulario de quien lee.

---

## Contenido

**Cada afirmación de dominio lleva prueba verificable al lado.** Link al certificado, a la demo, al repo, o una cifra concreta. Un CV lleno de adjetivos sin evidencia se lee igual que uno inventado.

**Nombres reales de los proyectos.** "Un sistema de automatización para un cliente" no dice nada. El nombre del sistema, qué resolvía y el número que movió, sí.

**Números con contexto.** "Reduje el proceso de 30 días a 30 minutos" vale más que "mejoré la eficiencia significativamente".

**El nivel declarado es el nivel real.** Si tu Python es intermedio, dice intermedio. Hay cargos donde intermedio alcanza perfecto, y los que no, igual te iban a descubrir.

---

## Paginación, la trampa silenciosa

Al generar el PDF desde HTML, `page-break-inside: avoid` va **solo en los bloques chicos** (cada empleo, cada proyecto, cada aparición).

**Nunca lo pongas en `.section` o en contenedores grandes.** Si un bloque no cabe en la página, el motor lo empuja entero a la siguiente y te deja media hoja en blanco, o peor, una página completa vacía en la mitad del CV.

---

## Verificación antes de enviar

**Un archivo que se escribió sin error no es un archivo que funciona.**

- Abre el PDF y **léelo completo**. No lo mires en miniatura, léelo.
- Cuenta las páginas. Si hay una en blanco, es el bug de paginación de arriba.
- Revisa que no haya quedado texto de la plantilla ni del aviso anterior.
- Confirma que el nombre del archivo no delate que es una versión adaptada de otro proceso.

Nunca declares que un CV está listo sin haberlo abierto.

---

## Análisis inverso

El CV maestro también sirve al revés. En vez de preguntar "¿calzo con este aviso?", preguntar **"¿a qué cargos califico realmente con esto?"**.

Es útil porque el mercado nombra el mismo trabajo de formas muy distintas, y hay títulos donde calzas perfecto y ni sabías que existían.

Cómo se hace. Se toma el maestro, se extrae la lista real de capacidades con su nivel, y se contrasta contra las familias de cargos del mercado. La salida no es un sí o un no, son tres grupos.

- **Calificas hoy.** Postula ya.
- **Calificas con reposicionamiento.** El material está, hay que reordenar el CV y nombrar las cosas distinto.
- **Te falta algo concreto.** Y queda dicho qué es exactamente, para decidir si vale la pena adquirirlo.

Ese ejercicio conviene rehacerlo cada par de meses, porque el mercado inventa títulos nuevos todo el tiempo.
