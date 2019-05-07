// @Description     > Testing route
// @Route           > /api/test
// @Access Control  > Public
export default async (req, res, next) => {
  console.log(`testing...`);
  return res.status(200).json({
    message: `Yay! It is working!`,
  });
};
