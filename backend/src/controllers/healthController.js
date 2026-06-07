export const getHealth = (request, response) => {
  response.status(200).json({
    status: "ok",
    message: "Pravesh Mitra API Running"
  });
};
