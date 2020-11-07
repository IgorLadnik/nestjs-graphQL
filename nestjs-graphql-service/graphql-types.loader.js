// This file was modified in order to load graohQL schema from Web.

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLTypesLoader = void 0;
const tslib_1 = require("tslib");
const merge_1 = require("@graphql-tools/merge");
const common_1 = require("@nestjs/common");
const glob = require("fast-glob");
const fs = require("fs");
const lodash_1 = require("lodash");
const util = require("util");
const normalize = require('normalize-path');
const readFile = util.promisify(fs.readFile);
const fetch = require("node-fetch");

async function importFile(url) {
	let script;
	try {
		script = await fetch(url);
	}
	catch (err) {
		const msg = `Error in importFile(${url}): ${err}`;
		console.log(msg);
		return msg;
	}

	if (!script.ok) {
		const msg = `Error in fetching fale from url \"${url}\"`;
		console.log(msg);
		return msg;
	}

  return await script.text();
}

let GraphQLTypesLoader = class GraphQLTypesLoader {
    mergeTypesByPaths(paths) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!paths || paths.length === 0) {
                return null;
            }
            const types = yield this.getTypesFromPaths(paths);
            const flatTypes = lodash_1.flatten(types);
            return merge_1.mergeTypeDefs(flatTypes, {
                throwOnConflict: true,
                commentDescriptions: true,
                reverseDirectives: true,
            });
        });
    }
    getTypesFromPaths(paths) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fileContentsPromises = paths.sort().map(filePath =>
				        importFile(filePath));

            return Promise.all(fileContentsPromises);
        });
    }
    includeNodeModules(pathOrPaths) {
        if (Array.isArray(pathOrPaths)) {
            return pathOrPaths.some((path) => path.includes('node_modules'));
        }
        return pathOrPaths.includes('node_modules');
    }
};
GraphQLTypesLoader = tslib_1.__decorate([
    common_1.Injectable()
], GraphQLTypesLoader);
exports.GraphQLTypesLoader = GraphQLTypesLoader;
