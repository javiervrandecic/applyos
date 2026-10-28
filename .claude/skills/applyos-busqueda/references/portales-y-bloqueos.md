# Portales, APIs y bloqueos

## Get on Board

API pública sin autenticación y con búsqueda de texto completo, por eso acá se busca por stack.

```
https://www.getonbrd.com/api/v0/search/jobs?query=<término>&per_page=30&page=<n>
```

Trampas: `rejected_reasons` no vacío (talent pool) no es vacante abierta. `countries` casi siempre trae solo `["Remote"]` y no es confiable. `company` puede venir vacío, resuélvelo con la API de empresas o el slug. El detalle se lee mejor en la página pública del aviso.

## LinkedIn (sin sesión)

```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=<término>&location=<país>&f_TPR=r1296000&sortBy=DD&start=<n>
```

1. Ventana de 15 días (`r1296000`), no de 7.
2. Pagina de a 10 hasta que devuelva menos de 10.
3. Reporta cuántos resultados trajo cada término y hasta qué `start` llegó.
4. Busca por título de cargo, no por stack.
5. `location=Remote` devuelve el país de la oficina, no significa remoto.
6. Tras unas 25 búsquedas seguidas empieza a devolver 0 o exactamente 10 sin error. Pausa entre búsquedas y reintenta aparte lo sospechoso.

Detalle de un aviso: `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/<id>`. Un aviso dentro de la ventana puede estar cerrado, y eso solo se ve con sesión iniciada: pide a la persona que abra el link antes de invertir en un CV.

## Portales locales y ATS

Usa el buscador por término, no el listado por categoría (suele truncar en 30). Pagina con profundidad mínima fija.

```
https://api.ashbyhq.com/posting-api/job-board/<empresa>
https://apply.workable.com/api/v1/widget/accounts/<empresa>
```

Los buscadores generales sirven para descubrir, nunca para cerrar un veredicto. Busca la vacante en su fuente original o márcala "pendiente de fuente verificable".

## Bloqueos 403 y 429

Un portal que suele traer resultados y hoy trae 0 está bloqueado, no vacío.

1. Reintenta una vez con pausa.
2. Cambia de método (script con cabecera de navegador, lectura web del agente, endpoint alternativo).
3. Si fallan los dos, repórtalo como BLOQUEADO con lo que intentaste y entrega los links con el filtro ya puesto.

Nunca lo saltes en silencio ni lo registres como "no hay avisos".
