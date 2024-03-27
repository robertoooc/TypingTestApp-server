const catchAsync = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch((err: any) => next(err));
  };
};
export default catchAsync;
