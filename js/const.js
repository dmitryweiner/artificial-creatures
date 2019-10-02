'use strict';

const GAME_FIELD_ID = 'gameField';
const DELAY = 100;
const FOOD_DELAY = 2500;
const MAX_TTL = 120000;
const POPULATION_SIZE = 50;
const ELITISM = 5;
const MUTATION_RATE = 0.5;
const MUTATION_AMOUNT = 3;
const MAX_SEEKING_DISTANCE = 200;
const SECTORS_OF_VISION = 16;

const FOUND_FOOD_SCORE = 50;
const CLOSER_TO_FOOD_SCORE = 5;
const DEATH_SCORE = 100;
