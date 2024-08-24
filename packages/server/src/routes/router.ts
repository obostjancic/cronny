import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
  type RouterOptions,
} from "express";

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head"
  | "all";

const methods: Method[] = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
  "all",
];

function AsyncRouter(options?: RouterOptions): Router {
  const router = Router(options);

  methods.forEach((method) => {
    const originalMethod = router[method];
    // @ts-ignore
    router[method] = (path: string, ...handlers: RequestHandler[]) => {
      const wrappedHandlers = handlers.map((handler) => asyncHandler(handler));
      // @ts-ignore
      return originalMethod.call(router, path, ...wrappedHandlers);
    };
  });

  return router;
}

export default AsyncRouter;
