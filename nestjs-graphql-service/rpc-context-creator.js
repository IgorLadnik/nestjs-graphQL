"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@nestjs/common/constants");
const constants_2 = require("@nestjs/core/guards/constants");
const constants_3 = require("@nestjs/core/injector/constants");
const exceptions_1 = require("../exceptions");
class RpcContextCreator {
    constructor(rpcProxy, exceptionFiltersContext, pipesCreator, pipesConsumer, guardsContextCreator, guardsConsumer, interceptorsContextCreator, interceptorsConsumer) {
        this.rpcProxy = rpcProxy;
        this.exceptionFiltersContext = exceptionFiltersContext;
        this.pipesCreator = pipesCreator;
        this.pipesConsumer = pipesConsumer;
        this.guardsContextCreator = guardsContextCreator;
        this.guardsConsumer = guardsConsumer;
        this.interceptorsContextCreator = interceptorsContextCreator;
        this.interceptorsConsumer = interceptorsConsumer;
    }
    create(instance, callback, module, contextId = constants_3.STATIC_CONTEXT, inquirerId) {
        const contextType = 'rpc';
        const exceptionHandler = this.exceptionFiltersContext.create(instance, callback, module, contextId, inquirerId);
        const pipes = this.pipesCreator.create(instance, callback, module, contextId, inquirerId);
        const guards = this.guardsContextCreator.create(instance, callback, module, contextId, inquirerId);
        const metatype = this.getDataMetatype(instance, callback);
        const interceptors = this.interceptorsContextCreator.create(instance, callback, module, contextId, inquirerId);
        const fnCanActivate = this.createGuardsFn(guards, instance, callback, contextType);
        const handler = (args) => async () => {
            const [data, ...params] = args;
            const result = await this.pipesConsumer.applyPipes(data, { metatype }, pipes);
            return callback.call(instance, result, ...params);
        };
        return this.rpcProxy.create(async (...args) => {
            fnCanActivate && (await fnCanActivate(args));
            return this.interceptorsConsumer.intercept(interceptors, args, instance, callback, handler(args), contextType);
        }, exceptionHandler);
    }
    reflectCallbackParamtypes(instance, callback) {
        return Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, instance, callback.name);
    }
    getDataMetatype(instance, callback) {
        const paramtypes = this.reflectCallbackParamtypes(instance, callback);
        return paramtypes && paramtypes.length ? paramtypes[0] : null;
    }
    createGuardsFn(guards, instance, callback, contextType) {
        const canActivateFn = async (args) => {
            const canActivate = await this.guardsConsumer.tryActivate(guards, args, instance, callback, contextType);
            if (!canActivate) {
                throw new exceptions_1.RpcException(constants_2.FORBIDDEN_MESSAGE);
            }
        };
        return guards.length ? canActivateFn : null;
    }
}
exports.RpcContextCreator = RpcContextCreator;
