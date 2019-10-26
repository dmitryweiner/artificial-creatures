# Artificial creatures
Artificial evolution of neural networks (NEAT).

See working example here http://dweiner.ru/ai/

Inspiration https://github.com/zonetti/snake-neural-network

Another good example https://github.com/wagenaartje/agario-ai

### Technologies
* ES6
* Webpack 4
* Neataptic.js https://wagenaartje.github.io/neataptic/docs/

### Patch
Patch to avoid "Module not found: Error can't resolve 'child_process'"
https://stackoverflow.com/questions/54459442/module-not-found-error-cant-resolve-child-process-how-to-fix

### Training from random population:

```npm run train```

### Training previously saved population:
Using this file src/scripts/population.mjs

```npm run train continue```

### View in browser:

```npm start```

### Build for production:

```npm run build```