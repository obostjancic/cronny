import { Router, } from "express";
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
const methods = [
    "get",
    "post",
    "put",
    "delete",
    "patch",
    "options",
    "head",
    "all",
];
function AsyncRouter(options) {
    const router = Router(options);
    methods.forEach((method) => {
        const originalMethod = router[method];
        // @ts-ignore
        router[method] = (path, ...handlers) => {
            const wrappedHandlers = handlers.map((handler) => asyncHandler(handler));
            // @ts-ignore
            return originalMethod.call(router, path, ...wrappedHandlers);
        };
    });
    return router;
}
export default AsyncRouter;
