import neataptic from 'neataptic';
import * as constants from './const.mjs';

export function generateId()
{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Returns random emoji char like rat or mouse
 * @returns {string}
 */
export function getEmojiForCreature() {
    const emoji = [
        '\u{1F400}',
        '\u{1F407}',
        '\u{1F43F}',
        '\u{1F413}',
        '\u{1F427}',
        '\u{1F986}',
        '\u{1F989}',
        '\u{1F986}',
        '\u{1F41E}',
        '\u{1F577}',
        '\u{1F980}',
        '\u{1F980}',
        '\u{1F990}',
        '\u{1F991}',
        '\u{1F41C}',
    ];

    return emoji[Math.round(Math.random() * (emoji.length - 1))];
}

/**
 * Returns food emoji
 * @returns {string}
 */
export function getEmojiForFood() {
    const emoji = [
        '\u{1F966}',
        '\u{1F344}',
        '\u{1F955}',
        '\u{1F353}',
        '\u{1F352}',
        '\u{1F350}',
        '\u{1F34F}',
        '\u{1F34E}',
        '\u{1F34D}',
        '\u{1F34C}',
        '\u{1F349}',
        '\u{1F347}',
    ];

    return emoji[Math.round(Math.random() * (emoji.length - 1))];
}

/**
 * Normalize vector
 *
 * {array} v
 * @returns {array}
 */
export function normalize(v) {
    if (!Array.isArray(v) || v.length === 0) {
        throw new Error('Wrong parameter');
    }
    let result = v;
    const max = Math.max(...result);
    if (max !== 0) {
        result = result.map((e) => e / max);
    }
    return result;
}

/**
 *
 * {array} v
 * @returns {array}
 */
export function sigmoidize(v) {
    if (!Array.isArray(v) || v.length === 0) {
        throw new Error('Wrong parameter');
    }
    return v.map((element) => 1 / (1 + Math.pow(Math.E, - element)));
}

/** Get the angle from one point to another */
export function angleToPoint(x1, y1, x2, y2) {
    const d = distance(x1, y1, x2, y2);
    const dx = (x2 - x1) / d;
    const dy = (y2 - y1) / d;

    let a = Math.acos(dx);
    a = dy < 0 ? 2 * Math.PI - a : a;
    return a;
}

/** Calculate distance between two points */
export function distance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
}

export function mutate(neat) {
    neat.sort();

    const newGeneration = [];
    for (let i = 0; i < neat.elitism; i++) {
        newGeneration.push(neat.population[i]);
    }
    for (let i = 0; i < neat.popsize - neat.elitism; i++) {
        const offspring = neat.getOffspring();
        newGeneration.push(offspring);
    }
    for (let i = 0; i < newGeneration.length; i++) {
        newGeneration[i].score = 0;
    }
    neat.population = newGeneration;
    neat.mutate();

    neat.generation++;
    return neat;
}

export function createNeatapticObject(popSize = null) {
    const realPopSize = popSize ? popSize : constants.POPULATION_SIZE;
    return new neataptic.Neat(
        constants.SECTORS_OF_VISION + 4, // inputs: sectors around + edge detection
        2, // output channels: angle and speed
        null, // ranking function
        {
            // mutation: [
            //     neataptic.methods.mutation.ADD_NODE,
            //     neataptic.methods.mutation.SUB_NODE,
            //     neataptic.methods.mutation.ADD_CONN,
            //     neataptic.methods.mutation.SUB_CONN,
            //     neataptic.methods.mutation.MOD_WEIGHT,
            //     neataptic.methods.mutation.MOD_BIAS,
            //     neataptic.methods.mutation.MOD_ACTIVATION,
            //     neataptic.methods.mutation.ADD_GATE,
            //     neataptic.methods.mutation.SUB_GATE,
            //     neataptic.methods.mutation.ADD_SELF_CONN,
            //     neataptic.methods.mutation.SUB_SELF_CONN,
            //     neataptic.methods.mutation.ADD_BACK_CONN,
            //     neataptic.methods.mutation.SUB_BACK_CONN
            // ],
            popsize: realPopSize,
            elitism: constants.ELITISM,
            mutationRate: constants.MUTATION_RATE,
            mutationAmount: constants.MUTATION_AMOUNT,
            // network: new neataptic.architect.Random(
            //     constants.SECTORS_OF_VISION + 4,
            //     0,
            //     2
            // ),
        }
    );

}
