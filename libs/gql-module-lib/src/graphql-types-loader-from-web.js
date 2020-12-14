// This file was modified in order to load GraphQL schema from Web.

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GraphQLTypesLoader = void 0;
const tslib = require('tslib');
const merge = require('@graphql-tools/merge');
const common = require('@nestjs/common');
const lodash = require('lodash');
const fetch = require('node-fetch');
const { logger } = require('logger-lib');

let GraphQLTypesLoaderFromWeb = class GraphQLTypesLoaderFromWeb {
  async importFile(url) {
    let script;
    try {
      script = await fetch(url);
    }
    catch (err) {
      logger.error(`Error in importFile(${url}): ${err}`)
      return;
    }

    if (!script.ok) {
      logger.error(`Error in fetching from url \"${url}\"`);
      return;
    }

    return await script.text();
  }

  mergeTypesByPaths(paths) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
      if (!paths || paths.length === 0) {
          return null;
      }
      const types = yield this.getTypesFromPaths(paths);
      const flatTypes = lodash.flatten(types);
      return merge.mergeTypeDefs(flatTypes, {
          throwOnConflict: true,
          commentDescriptions: true,
          reverseDirectives: true,
      });
    });
    }
    getTypesFromPaths(paths) {
      return tslib.__awaiter(this, void 0, void 0, function* () {
        return Promise.all(paths.sort().map(async filePath => await this.importFile(filePath)));
      });
    }
};
GraphQLTypesLoaderFromWeb = tslib.__decorate([
    common.Injectable()
], GraphQLTypesLoaderFromWeb);
exports.GraphQLTypesLoaderFromWeb = GraphQLTypesLoaderFromWeb;
