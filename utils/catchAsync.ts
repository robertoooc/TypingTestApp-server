const catchAsync = (fn:any) => {
  console.log('inside the catch async')
  return (req:any, res:any, next:any) => {
    fn(req,res,next).catch((err:any)=>next(err));
  }
}
export default catchAsync;