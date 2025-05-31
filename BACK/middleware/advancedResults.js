const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copie de req.query
  const reqQuery = { ...req.query };

  // Champs à exclure
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Suppression des champs exclus de reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Création d'une chaîne de requête
  let queryStr = JSON.stringify(reqQuery);

  // Création d'opérateurs ($gt, $gte, etc.)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Recherche dans la base de données
  query = model.find(JSON.parse(queryStr));

  // Sélection de champs
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-dateCreation');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Population
  if (populate) {
    query = query.populate(populate);
  }

  // Exécution de la requête
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
