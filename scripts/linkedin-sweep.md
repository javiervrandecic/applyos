# Barrido de LinkedIn

LinkedIn no tiene API pública de empleos, pero el endpoint que alimenta el scroll infinito de la búsqueda pública responde sin login.

```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search
  ?keywords=<término>
  &location=<país o región>
  &f_TPR=r1296000
  &sortBy=DD
  &start=<0, 10, 25, ...>
```

Devuelve HTML con las tarjetas de resultado. Título, empresa, ubicación y antigüedad.

## Parámetros

| Parámetro | Qué hace |
|---|---|
| `keywords` | término de búsqueda, URL-encoded |
| `location` | país en inglés (`Chile`, `Spain`), región (`European Union`) o ciudad |
| `f_TPR` | ventana de tiempo en segundos, con prefijo `r`. `r1296000` son 15 días |
| `sortBy` | `DD` por fecha descendente. **Nunca dejar el default**, que ordena por relevancia |
| `start` | desplazamiento de paginación. 0, 10, 25... |

## Las cuatro trampas

**1. La ventana.** `r604800` son 7 días y parece lo razonable. No lo es. Los avisos de jefatura viven semanas y el proceso sigue abierto. Usa `r1296000`.

**2. La paginación silenciosa.** Devuelve 10 resultados y ningún indicador de que haya más. Si no pides `start=10`, crees que viste el mercado completo. Pagina hasta que una llamada devuelva menos de 10.

**3. El buscador no lee el cuerpo del aviso.** Buscar `n8n` en un país devolvió 2 resultados mientras tres avisos distintos nombraban n8n en su descripción. **Pesa el título del cargo.** Acá van variantes de título, no tecnologías. Las tecnologías se buscan en Get on Board, que sí hace texto completo.

**4. `location=Remote` devuelve el país de la oficina, no la modalidad.** Cuatro búsquedas así dieron 40 resultados, todos presenciales en otros continentes. Para remoto real hay que leer el detalle de cada aviso.

## Estrategia de términos

Como el buscador pesa el título, una sola variante no alcanza. Corre una búsqueda por cada forma en que el mercado nombra tu función.

Ejemplo para un perfil de IA y automatización. `AI engineer`, `especialista IA`, `ingeniero IA`, `gestor IA`, `arquitecto inteligencia artificial`, `Director of AI`, `automatizacion IA`, `Forward Deployed Engineer`, `transformacion digital`.

Cada una encuentra avisos que las otras no. En una auditoría real, seis de esos términos faltaban y cada uno correspondía a un candidato perdido.

**Y busca cada término en tu país, no solo en "Remote".** Un término que asocias a lo internacional puede estar publicado localmente. Ese error costó un cargo remoto en la propia ciudad del candidato.
