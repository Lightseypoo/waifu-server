"use strict";

const path = require("path");
const scoreDataSchema = require(path.join(process.cwd(), "data", "scoreData_schema.json"));
const gameIds = ["all", "etterna", "osu", "ffr", "quaver"];

class Data {
    constructor() {} // Static

    static GetScoreSchema(gamecode) {
        if (!gamecode)
            Crash(console.trace(), "Invalid Game Code", true);
        return scoreDataSchema[gamecode];
    }

    static GameId(gamecode) {
        return gameIds.indexOf(gamecode);
    }
}

module.exports = Data;