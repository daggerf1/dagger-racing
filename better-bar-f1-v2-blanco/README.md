# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).


## Sistema F1 integrado

- `npm run dev`: desarrollo local.
- `npm run build`: build de producción.
- `npm run update:f1`: actualiza pilotos y constructores desde Formula1.com.
- `/campeonato`: clasificación con diseño Better Bar y enlaces a pilotos/equipos.
- `/horarios` y `/calendario`: calendario 2026 con conversión automática a la zona horaria del visitante.
- `/piloto/<slug>` y `/equipo/<slug>`: páginas enlazables.

### Automatización
`.github/workflows/update-f1.yml` ejecuta la actualización cada 3 horas. Al conectar el repositorio de GitHub con Vercel, un commit con datos nuevos dispara un nuevo despliegue automáticamente.
