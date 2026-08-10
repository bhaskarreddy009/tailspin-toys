import { eq, asc, count } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

export const GAMES_PER_PAGE = 9;

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

export interface GamesPage {
    games: Game[];
    totalPages: number;
}

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/** All games ordered by title. */
export async function getAllGames(db: Database): Promise<Game[]> {
    const rows = await baseGamesQuery(db).orderBy(asc(games.title), asc(games.id));
    return rows.map(mapGame);
}

/** All game ids ordered by title. */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title), asc(games.id));
    return rows.map((row) => row.id);
}

/** The number of pages required to display all games at the given limit. */
export async function getGamePageCount(db: Database, limit: number): Promise<number> {
    assertPageLimit(limit);
    const [result] = await db.select({ total: count() }).from(games);
    return Math.ceil(result.total / limit);
}

/** A title-ordered page of games with its total number of pages. */
export async function getGamesPage(db: Database, page: number, limit: number): Promise<GamesPage> {
    assertPageNumber(page);
    const totalPages = await getGamePageCount(db, limit);
    const rows = await baseGamesQuery(db)
        .orderBy(asc(games.title), asc(games.id))
        .limit(limit)
        .offset((page - 1) * limit);

    return { games: rows.map(mapGame), totalPages };
}

/** A single game by id, or null when it does not exist. */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}

function assertPageNumber(page: number): void {
    if (!Number.isInteger(page) || page < 1) {
        throw new RangeError('Page must be a positive integer.');
    }
}

function assertPageLimit(limit: number): void {
    if (!Number.isInteger(limit) || limit < 1) {
        throw new RangeError('Limit must be a positive integer.');
    }
}
